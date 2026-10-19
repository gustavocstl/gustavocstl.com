---
slug: "/tomar-menos-decisoes-arquiteturais-pode-resultar-em-uma-arquitetura-melhor"
date: "2026-10-18"
title: "Tomar menos decisões arquiteturais pode resultar em uma arquitetura melhor"
description: "Se o arquiteto tentar controlar demais, vai encontrar resistência dos times. Se controlar de menos, não contribui em nada."
---

Estou lendo o livro [Design It!](https://pragprog.com/titles/mkdsa/design-it/), que um amigo me indicou, e o livro menciona o artigo [Less is More with Minimalist Architecture](https://www.bredemeyer.com/pdf_files/MinimalistArchitecture.PDF). Esse artigo mudou um pouco a forma como eu penso sobre decisões arquiteturais.

O artigo começa com um dilema: se o arquiteto tentar controlar demais, vai encontrar resistência dos times. Se controlar de menos, não contribui em nada.

A ideia que o artigo propõe é que o arquiteto foque nas decisões que vão impactar o sistema como um todo. O restante das decisões pode ficar com o time técnico, pois são decisões que impactam somente o contexto daquele time.

## O que é uma decisão arquitetural

Decisões arquiteturais são aquelas que precisam ser tomadas olhando para o sistema como um todo. São decisões que definem os principais elementos do sistema, como eles se comunicam e tambem decisões que afetam várias partes do sistema ao mesmo tempo, como segurança, observabilidade e consistência de dados.

Um teste simples para saber se uma decisão é arquitetural:

**Se o requisito pode ser atendido deixando a decisão para um nível abaixo, então ela não é arquitetural.**

Imagine um sistema de ecommerce com os serviços **Orders**, **Payments** e **Shipping**. Decidir que os serviços se comunicam por eventos, qual o formato desses eventos e como funciona a autenticação entre eles são decisões arquiteturais, pois se cada time decidir de um jeito, os serviços não conseguem conversar entre si. Agora, qual ORM o serviço de **Payments** usa ou como ele organiza as pastas do projeto é uma decisão que o time de **Payments** consegue tomar sozinho, sem afetar nenhum outro serviço, então não deveria fazer parte da arquitetura.

Já em domínios regulados, como saúde e financeiro, decisões que parecem locais como definir uma biblioteca de criptografia ou a forma de guardar dados pessoais, precisam ser iguais em todos os serviços para garantir compliance. Nesses casos, essas decisões podem sim fazer parte da arquitetura. O teste pra saber se uma decisão é arquitetrual continua valendo, mas aqui existe um requisito novo, como por exemplo, garantir compliance, que um time sozinho não consegue atender. Por isso a decisão passa a ser arquitetural.

De forma geral, uma decisão que só afeta uma aplicação não deveria ser tomada por arquitetura.

## O custo de cada decisão

Cada decisão arquitetural tira um pouco da liberdade de quem está desenvolvendo. A única justificativa para isso é quando a decisão traz um benefício para o sistema como um todo que não seria possível de outra forma.

Além disso, cada nova decisão pode diminuir o impacto das outras, por exemplo, se a arquitetura define que os serviços se comunicam por eventos, mas também define o ORM, a estrutura de pastas e a lib de logs de cada serviço, a decisão sobre eventos passa a ter o mesmo peso de uma regra sobre pastas. Os times deixam de saber o que realmente importa e a resistência aumenta.

O artigo usa um termo que eu gostei: se você impõe arquitetura demais e rápido demais, a organização desenvolve **"anticorpos"** contra qualquer tentativa de controle arquitetural, mesmo as que trazem benefícios.

O outro extremo também é um problema. O arquiteto que evita decidir qualquer coisa não ajuda o sistema a evoluir, e sem arquitetura o sistema só fica mais bagunçado com o tempo.

Para as decisões que são tomadas, o artigo sugere que cada uma tenha uma **justificativa documentada**, explicando por que ela é arquitetural. Assim, quem quiser questionar a decisão precisa trazer uma alternativa que atenda melhor os mesmos requisitos, e não apenas uma preferência pessoal. Hoje isso é muito parecido com o que fazemos com [ADRs (Architecture Decision Records)](https://adr.github.io/).

Outro ponto interessante é que uma boa arquitetura **dá mais autonomia** para os times. Quando as interfaces entre os serviços estão bem definidas, cada time consegue trabalhar no seu serviço sem precisar alinhar tudo com os outros times. Segundo o artigo, um desenvolvimento sem arquitetura, onde cada um faz do seu jeito, tira muito mais autonomia dos times do que a própria arquitetura.

## E com IA?

Pensei se um artigo de 2002 ainda faz sentido hoje, e na minha opinião faz ainda mais.

O artigo diz que desenvolvedores acabam tomando decisões que são boas localmente, mas ruins para o sistema como um todo, por não terem visibilidade das outras partes do sistema. Isso é exatamente o que acontece com um agente de IA gerando código, ele trabalha com um contexto limitado e vai resolver o problema que está na frente dele. Se o agente estiver alterando o serviço de **Payments** e não souber que os serviços se comunicam por eventos, ele pode muito bem criar uma chamada HTTP direta para o **Orders**, porque é a solução mais simples para aquela tarefa.

Como a IA escreve código muito rápido, essas decisões locais também se multiplicam muito rápido. Por isso, ter poucas decisões arquiteturais, claras e documentadas, ficou ainda mais importante. Essas decisões acabam virando contexto para os agentes, em arquivos como `AGENTS.md`.

A ideia de que mais decisões diminuem o impacto das outras também vale aqui. Quanto maior o número de instruções, maior pode ser a dificuldade de uma LLM em seguir todas essas instruções sempre. Por isso, poucas regras que realmente importam funcionam melhor do que uma lista gigante.

---

O artigo termina dizendo que é bom ter uma visão arquitetural ambiciosa, mas é preciso avançar em etapas. Uma arquitetura menor custa menos, fica pronta mais rápido e começa a gerar resultados antes.

> *By all means, have an ambitious architectural vision, but stage your progress toward that vision. A smaller, more focused architecture costs less, is quicker to produce, and gets results faster.*

No final, é muito mais sobre escolher o mais crítico para atacar primeiro com uma visão do sistema como um todo e deixar o restante ser definido por quem está mais perto do problema.

## Links Úteis

- [Less is More with Minimalist Architecture](https://www.bredemeyer.com/pdf_files/MinimalistArchitecture.PDF)
- [Design It!](https://pragprog.com/titles/mkdsa/design-it/)
- [Architecture Decision Records](https://adr.github.io/)
