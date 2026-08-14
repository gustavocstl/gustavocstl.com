---
slug: "/python-async-context-manager"
date: "2021-03-10"
title: "Python - Async Context Manager"
description: "O context manager do Python é bastante útil quando precisamos gerenciar recursos..."
---

O context manager do Python é bastante útil quando precisamos gerenciar recursos, é o gerenciador que irá fazer a inicialização e a finalização desses recursos.

Um exemplo bem simples é a escrita em um arquivo, precisamos abrir este arquivo, escrever algo e logo em seguida fechar o arquivo.

Assim ficaria sem o uso do context manager:
```py
f = open('example.txt', 'w')
f.write('Lorem ipsum')
f.close()
```

E assim ficaria usando context manager:
```py
with open('example.txt', 'w') as f:
    f.write('Lorem ipsum')
```

A declaração `with` indica que estamos usando o context manager e após finalizar as ações no arquivo ou caso qualquer erro ocorrer o arquivo será fechado. Caso queira saber mais sobre os context managers: 
- [https://book.pythontips.com/en/latest/context_managers.html](https://book.pythontips.com/en/latest/context_managers.html)
- [https://docs.python.org/3/reference/compound_stmts.html#the-with-statement](https://docs.python.org/3/reference/compound_stmts.html#the-with-statement)

## Async

Após uma introdução simples, podemos começar a falar sobre como trabalhar com eles de forma assíncrona.

Context managers assíncronos são úteis quando queremos usar o `await` para esperar algum recurso no momento da inicialização ou finalização de um contexto, os seguintes métodos são usados para isso:
- `__aenter__` - Para inicializar os recursos
- `__aexit__` - Para finalizar os recursos

Um exemplo pode ser uma classe de conexão com um banco de dados:

```py
class Connection():
    def __init__(self, connection_string: str = conn_str):
        self.connection_string = connection_string
        self.connector: Connector = None

    # Método de inicialização. Espera a conexão ficar pronta e retorna
    async def __aenter__(self):
        self.connector = await connection_factory(self.connection_string)
        return self

    # Método de finalização. Fecha a conexão e se necessário faz rollback
    async def __aexit__(self,
                        exception_type,
                        exception_value,
                        traceback) -> None:
        # Se ocorrer uma exceção, fazemos um rollback
        if exception_type:
            await self.connector.rollback()
            
        await self.connector.close()
```

E para fazer o uso da classe, usamos a mesma declaração `with`, mas com o adicional do `async` pois agora precisamos esperar a nossa classe `Connection` que é um *async context manager* e também esperar as ações dentro do contexto executarem:

```py
# Exemplo básico usando a conexão para executar queries
async with Connection() as conn:
    await conn.connector.execute('UPDATE users SET...')
    await conn.connector.commit()
```

Assim que todas as operações finalizarem ou caso ocorra alguma exceção, o método `__aexit__` será chamado e a conexão será fechada. Isso nos ajuda pois não precisamos chamar o método para fechar a conexão em cada uso ou então lidar com o rollback caso exceções aconteçam e de certa forma fica muito mais claro o que está acontecendo no código.

## Links Úteis

- [Asynchronous Context Managers](https://docs.python.org/3/reference/datamodel.html#async-context-managers)
- [Python AbstractAsyncContextManager Documentation](https://docs.python.org/3/library/contextlib.html#contextlib.AbstractAsyncContextManager)