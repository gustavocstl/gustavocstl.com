---
slug: "/semanticas-de-entrega-em-sistemas-de-mensageria"
date: "2025-12-06"
title: "Semânticas de Entrega em Sistemas de Mensageria"
description: "As semânticas de entrega representam as garantias que o sistema oferece sobre como a mensagem será entregue aos consumidores quando acontecerem falhas..."
---

Tenho estudado sobre sistemas distribuídos e um tema que estou focando atualmente é sistemas de mensageria, especificamente sobre como as mensagens são entregues.
Existem diversas soluções de mensageria distribuída, cada uma com as suas funcionalidades e características, e uma coisa em comum entre elas são as **semânticas de entrega**.
Entender essas semânticas é importante na tomada de decisão no momento de escolher alguma dessas soluções. Vou usar este post para descrever tudo o que aprendi até agora e também mostrar alguns exemplos de como o Kafka e RabbitMQ implementam as semânticas de entrega.

## Semânticas de entrega

De forma simples, as semânticas de entrega representam as garantias que o sistema oferece sobre como a mensagem será entregue aos consumidores quando acontecerem falhas.

Em sistemas distribuídos, qualquer parte do sistema pode falhar de forma independente. Por exemplo, uma aplicação que publica mensagens em um broker pode receber um erro antes de conseguir publicar a mensagem, ou se a aplicação conseguir publicar, o broker pode falhar antes de confirmar que recebeu a mensagem.

Quando acontece uma falha, a aplicação precisa tomar alguma decisão sobre o que fazer com a mensagem (reenviar, ignorar, persistir em algum lugar, etc). Com base na decisão que a aplicação tomar, temos diferentes semânticas de entrega:

### at-least-once (garante a entrega da mensagem pelo menos uma vez)

A aplicação publica a mensagem e aguarda uma confirmação do broker. Se acontecer uma falha enquanto espera a confirmação (timeout, erro de rede ou falha do broker) a aplicação irá reenviar a mensagem.

Por conta do reenvio, é garantido que a mensagem será entregue pelo menos uma vez, mas isso também significa que podem ter mensagens duplicadas pois o broker pode ter recebido a mensagem, mas falhou antes de retornar a confirmação, com isso a aplicação acaba fazendo uma nova tentativa para publicar a mensagem.

### at-most-once (garante a entrega da mensagem no máximo uma vez)

A aplicação publica a mensagem, mas não faz retentativas em caso de falhas. Isso garante que a mensagem não será duplicada, mas também significa que se tiver uma falha no broker, a mensagem não será entregue pois não existem retentativas.

### exactly-once (garante que o efeito de consumir a mensagem ocorrerá exatamente uma vez)

A aplicação publica a mensagem e faz retentativas em caso de falhas, porém mesmo fazendo retentativas, o sistema garante que quando o consumidor processar essa mensagem, o efeito do processamento será aplicado apenas uma vez.

Aqui é importante mencionar que a garantia é sobre **o efeito de processar a mensagem** e não sobre o recebimento da mensagem, isso porque podem acontecer casos onde o consumidor recebe a mesma mensagem mais de uma vez (essa é a natureza de sistemas distribuídos), porém como as operações são idempotentes e protegidas por transações é garantido que o efeito final no sistema será como se a mensagem tivesse sido processada apenas uma vez.

Essa semântica é complexa de ser implementada pois exige que tenha cooperação entre o publicador, broker e consumidor, e geralmente essa garantia é feita através de transações, idempotência e deduplicação. Por isso que dependendo do cenário, essa é uma garantia que pode custar caro em termos de performance e latência.

## RabbitMQ

RabbitMQ é um broker baseado em filas e roteamento, ele segue um modelo push onde o broker envia as mensagens para os consumidores assim que elas chegam. RabbitMQ oferece **at-most-once** e **at-least-once**, mas não oferece **exactly-once**.

<img alt="Exemplo RabbitMQ" src="/images/rabbitmq-example.png" align="center">

O RabbitMQ usa os [acknowledgements](https://www.rabbitmq.com/docs/confirms) como uma forma de garantir tanto a publicação quanto o consumo das mensagens.

No lado do publicador, os acknowledgements são usados para garantir que o RabbitMQ recebeu a mensagem, esses são conhecidos como *publisher confirms*. Já no lado do consumidor, os *consumer acknowledgements* garantem ao RabbitMQ que a mensagem foi recebida e processada com sucesso.

### Publisher Confirms

O publicador precisa explicitamente habilitar os *publisher confirms* quando abre um [channel](https://www.rabbitmq.com/docs/channels) com o RabbitMQ. Após habilitar os *publisher confirms*, cada publicação passa a ter um retorno do broker indicando o resultado do processamento:
- **basic.ack** Significa que a mensagem foi recebida e persistida com sucesso e agora o RabbitMQ é o responsável por essa mensagem.
- **basic.nack** Significa que o RabbitMQ teve um erro para processar a mensagem e ela não foi persistida localmente, ou seja, não será enviada para os consumidores. O publicador ainda é o responsável por essa mensagem.

Usando *publisher confirms* é possível implementar o **at-least-once** do publicador para o RabbitMQ, pois garante que mesmo em caso de falhas o publicador irá fazer retentativas para que a mensagem seja persistida no RabbitMQ.

Um publicador pode decidir não usar a *publisher confirms*, desta forma apenas publica a mensagem sem se importar com o resultado. Isso evita retentativas no publicador, mas significa que mensagens podem ser perdidas caso o RabbitMQ falhar, esse cenário implementa o **at-most-once** do publicador para o RabbitMQ.

### Consumer Acknowledgements

Quando o consumidor recebe uma mensagem do RabbitMQ, ele precisa responder sobre o resultado do processamento dessa mensagem. Com base nesse resultado o RabbitMQ pode tomar algumas decisões sobre o que fazer com a mensagem:
- **basic.ack** Significa que o consumidor processou com sucesso a mensagem. O RabbitMQ pode remover a mensagem da fila.
- **basic.nack** Significa que o consumidor não conseguiu processar a mensagem. Aqui o consumidor pode adicionar uma [flag](https://www.rabbitmq.com/docs/confirms#consumer-nacks-requeue:~:text=broker%2E-,This,discarded) dizendo para o RabbitMQ mandar essa mensagem para a fila novamente. Sem a flag, o RabbitMQ manda a mensagem para uma [Dead Letter Exchange](https://www.rabbitmq.com/docs/dlx) se tiver configurada, caso contrário descarta a mensagem.

Se o consumidor só confirma após processar, temos **at-least-once** do consumidor para o RabbitMQ. Se o consumidor desabilita as confirmações, temos algo mais próximo do **at-most-once** do consumidor para o RabbitMQ, pois o broker apenas irá enviar a mensagem e remover da fila sem aguardar uma resposta do consumidor.

Por exemplo, imagine um consumidor que demora alguns minutos para processar cada mensagem, ele envia um **basic.ack** somente após terminar de processar. Se a conexão for perdida, todas as mensagens que não receberam o **basic.ack** no RabbitMQ serão reenviadas para o consumidor novamente. Como o RabbitMQ não oferece **exactly-once**, isso pode causar duplicidades na sua aplicação. É aqui que entra a parte da **idempotência**, se você precisa garantir que as mensagens não serão perdidas, então os consumidores precisam estar preparados para lidar com mensagens duplicadas. Todo processamento de mensagem precisa ser **idempotente** neste caso.


## Apache Kafka

No Kafka não existe o conceito de filas igual no RabbitMQ, ao invés de adicionar as mensagens em uma fila, o Kafka apenas adiciona um novo registro no [log](https://kafka.apache.org/documentation/#log). Esse log é distribuído e replicado entre outros nós no cluster. Kafka oferece **at-most-once**, **at-least-once** e **exactly-once**.


<img alt="Exemplo Kafka" src="/images/kafka-example.png" align="center">

O Kafka usa [producer acks](https://docs.confluent.io/kafka/design/replication.html#in-sync-replicas-and-producer-acks) para garantir o envio da mensagem pelo publicador e usa [offset tracking](https://docs.confluent.io/kafka/design/consumer-design.html#tracking-consumer-position) para garantir que os consumidores processaram uma mensagem.

### Producer Acks

O publicador envia uma mensagem para o Kafka e aguarda um ack. O tipo de ack depende da configuração definida no momento em que o publicador é criado:

- **acks=0** O publicador não precisa aguardar nenhuma confirmação. Este implementa o **at-most-once** o que significa que pode ter perda de mensagens em caso de falhas.
- **acks=1** O publicador espera uma confirmação após o Kafka gravar a mensagem, mesmo que ainda não tenha sido replicada para todos os nós. Aqui ainda pode ter perda de mensagem caso aconteça alguma falha na replicação.
- **acks=all** O publicador espera uma confirmação após o Kafka gravar a mensagem e replicar para todos os nós. Este é o cenário que implementa **at-least-once** já que se acontecer alguma falha durante a replicação, o publicador irá fazer retentativas e isso pode gerar duplicatas.

Aqui tem um ponto muito importante que é uma das diferenças entre as semânticas que o RabbitMQ oferece. O Kafka permite [publicações idempotentes](https://docs.confluent.io/kafka/design/delivery-semantics.html#producer-delivery:~:text=The%20idempotent%20delivery%20option%20guarantees%20that%20resending%20a%20message%20will%20not%20result%20in%20duplicate%20entries%20in%20the%20log%2C%20and%20that%20log%20order%20is%20maintained%2E), isso garante que o broker não irá gravar mensagens duplicadas quando o mesmo publicador reenviar a mesma mensagem. Isso é feito adicionando um ID para o publicador e um número sequencial em cada mensagem como chave idempotente.

### Offset Tracking

Os consumidores do Kafka usam *offset tracking* para controler quais mensagens já foram processadas com sucesso. Cada mensagem possui um offset sequencial e o consumidor decide quando confirmar o próximo offset.

A confirmação (offset commit) é o mecanismo que define a semântica de entrega:

- **at-most-once** Acontece quando o offset é confirmado antes do processamento. Se ocorrer uma falha, a mensagem não será consumida, isso pode gerar perdas.
- **at-least-once** Acontece quando o offset é confirmado após o processamento. Se ocorrer uma falha, o consumidor irá reler a mensagem, isso pode gerar duplicatas.

### Transactions e exactly-once

O Kafka oferece **exactly-once** quando o consumo de uma mensagem produzir outra mensagem para um tópico do próprio Kafka ([Kafka Streams](https://docs.confluent.io/platform/current/streams/concepts.html)). Para isso é possível usar [transações](https://www.confluent.io/blog/transactions-apache-kafka/) que vão garantir que um conjunto de operações seja executado de forma [atômica](https://pt.wikipedia.org/wiki/Transa%C3%A7%C3%A3o_at%C3%B4mica):
1. Lê uma mensagem com um offset X
2. Processa a mensagem de forma idempotente
3. Publica o resultado em um tópico
4. Faz o *commit* da transação contendo: as mensagens produzidas e o offset X+1 como concluído

Se o consumidor falhar antes do *commit* da transação, nada será gravado e o offset não será avançado, o que significa que a mensagem poderá ser consumida por outro consumidor sem gerar efeitos duplicados.

É importante destacar que o **exactly-once** do Kafka só é garantido quando todas as etapas do processamento ocorrem dentro do próprio Kafka. Assim que a aplicação interage com sistemas externos, como por exemplo, banco de dados ou serviços HTTP, a garantia depende inteiramente da idempotência implementadas pelo desenvolvedor. É por isso que essa é uma semântica complexa de alcançar e também tem custos significativos em termos de performance e latência.

## Links Úteis

- [RabbitMQ Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/confirms)
- [Kafka Semantics](https://kafka.apache.org/documentation/#semantics)
- [Kafka Transactions](https://www.confluent.io/blog/transactions-apache-kafka/)
- [Exactly-Once Semantics Are Possible: Here’s How Kafka Does It](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/)
- [RabbitMQ vs Kafka - Different Takes on Messaging](https://jack-vanlightly.com/blog/2017/12/4/rabbitmq-vs-kafka-part-1-messaging-topologies)
