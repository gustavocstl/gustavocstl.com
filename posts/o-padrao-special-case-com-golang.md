---
slug: "/o-padrao-special-case-com-golang"
date: "2021-03-05"
title: "O padrão Special Case com Golang"
description: "Implementando o padrão Special Case com Golang..."
---

Imagine uma aplicação que precisa realizar cobranças recorrentes de assinaturas e durante o planejamento dessa aplicação nos damos conta de que precisamos lidar com alguns casos específicos no momento de realizar a cobrança com os dados do usuário.

Alguns casos específicos são:
- Uma cobrança pode não completar por algum motivo
- Uma cobrança pode ser uma fraude

Podemos resolver isso de algumas formas e uma delas é colocar alguns `ifs` no código para lidar com cada caso no momento de cobrar, porém isso vai aumentar a [complexidade ciclomática](https://pt.wikipedia.org/wiki/Complexidade_ciclom%C3%A1tica) do nosso código e dependendo pode prejudicar o desenvolvimento. Veja abaixo como ficaria essa solução.

Aqui passamos por cada assinatura vencida e chamamos o método `Charge` que deve ser o responsável por realizar a cobrança:
```go
expiredSubscriptions := subscriptionRepository.GetExpiredSubscriptions()

for _, subscription := range expiredSubscriptions {
    err := paymentReceiver.Charge(subscription)
    ...
}
```

Aqui temos o método `Charge` e o receptor dele é o `PaymentReceiver`. Veja que esse método passou a fazer mais coisas do que o necessário com as condicionais que adicionamos:
```go
func (p PaymentReceiver) Charge(subscription model.Subscription) error {
	if isFraudDetected(subscription) {
		setFraudulentCharge(subscription)
		return errors.New("Fraudulent charge")
	}

	if isSubscriptionIncomplete(subscription) {
		setSubscriptionIncomplete(subscription)
		return errors.New("Incomplete charge")
	}

	setCompleteCharge(subscription)
	return nil
}
```

---

Podemos melhorar isso usando o padrão Special Case mencionado por **Martin Fowler** no livro Padrões de Arquitetura de Aplicações Corporativas.
https://martinfowler.com/eaaCatalog/specialCase.html

## Special Case

A ideia aqui é que tenhamos estruturas separadas para cada caso específico e cada estrutura seja responsável pelo seu próprio comportamento. Essas estruturas precisam implementar uma interface também, pois elas devem ter os mesmos métodos.

Declaramos a interface e no nosso caso temos apenas um método:
```go
type Charge interface {
	Execute() error
}
```

E então criamos as estruturas e definimos comportamentos diferentes em cada método `Execute`:
```go
// complete_charge.go

type CompleteCharge struct {
	subscription model.Subscription
}

func NewCompleteCharge(subscription model.Subscription) CompleteCharge {
	return CompleteCharge{
		subscription: subscription,
	}
}

func (c CompleteCharge) Execute() error {
	c.setCompleteCharge()
	return nil
}
```
```go
// incomplete_charge.go

type IncompleteCharge struct {
	subscription model.Subscription
}

func NewIncompleteCharge(subscription model.Subscription) IncompleteCharge {
	return IncompleteCharge{
		subscription: subscription,
	}
}

func (c IncompleteCharge) Execute() error {
	c.setIncompleteCharge()
	return errors.New("Incomplete charge")
}
```
```go
// fraudulent_charge.go

type FraudulentCharge struct {
	subscription model.Subscription
}

func NewFraudulentCharge(subscription model.Subscription) FraudulentCharge {
	return FraudulentCharge{
		subscription: subscription,
	}
}

func (c FraudulentCharge) Execute() error {
	c.setFraudulentCharge()
	return errors.New("Fraudulent charge")
}
```

## Factory Method

E aqui é onde entra outro padrão de projeto, o `Factory Method` que é o famoso método fábrica. Aqui será responsável por criar cada estrutura baseado no tipo de cobrança que precisamos:
```go
func NewChargeFactory(subscription model.Subscription) Charge {
	if isFraudDetected(subscription) {
		return NewFraudulentCharge(subscription)
	}

	if isSubscriptionIncomplete(subscription) {
		return NewIncompleteCharge(subscription)
	}

	return NewCompleteCharge(subscription)
}
```

Agora o nosso método `Charge` não precisa mais se preocupar em decidir o que fazer para cada caso que ocorrer na cobrança, ele apenas chama o método fábrica que irá retornar uma estrutura de cobrança e chama o método `Execute` dessa estrutura:
```go
func (p PaymentReceiver) Charge(subscription model.Subscription) error {
	charge := charge.NewChargeFactory(subscription)
	return charge.Execute()
}
```

## Conclusão

Separamos nossas lógicas de cobrança em vários casos especiais e cada caso tem o seu próprio comportamento. Essa é a ideia do Special Case e vale também mencionar que ele está muito relacionado com o padrão [Null Object](https://pt.stackoverflow.com/questions/88741/pra-que-serve-o-padr%C3%A3o-null-object) que de forma básica faz coisas parecidas para evitar o retorno do valor `null` no código.
Também podemos ver que os padrões de projetos muitas vezes irão ser usados em conjunto.

Caso queira ver o código utilizado aqui: [https://github.com/gustavocstl/special-case-pattern](https://github.com/gustavocstl/special-case-pattern)
