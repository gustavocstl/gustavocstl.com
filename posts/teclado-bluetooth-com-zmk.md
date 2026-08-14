---
slug: "/teclado-bluetooth-com-zmk"
date: "2025-07-20"
title: "Teclado Bluetooth com ZMK"
description: ""
---

Faz um tempo que comecei a pesquisar teclados mecânicos customizados e tinha essa curiosidade de como eles funcionam. Como existe muito material sobre isso e também ferramentas open source, decidi tentar criar o meu próprio teclado.

A principal motivação para mim foi a curiosidade e a vontade de aprender algo novo, além de ter a possibilidade de criar algo customizado para facilitar o meu dia a dia usando esse teclado.

Eu queria um teclado split, sem fio e que tivesse poucas teclas. Por ser um teclado sem fio eu decidi usar o firmware [ZMK](https://zmk.dev/docs) que tem suporte a bluetooth e baixo consumo de energia (isso é importante pois cada lado do teclado vai usar uma bateria).
Também decidi que o teclado seria todo "handwired" ao invés de fazer a PCB, isso ajudou a economizar um pouco.

Para definir tudo o que eu precisaria no teclado e testar algumas ideias, decidi criar uma modelagem 3D de como eu queria que ele ficasse:

<img alt="Modelagem 3D do teclado" src="/images/keyboard-3d-model.png" align="center">

Para esse teclado usei:
- 32 switches red da redragon
- 2 baterias recarregáveis de 3.7V e 100mAh
- 2 placas nrf52840 compatível com nice!nano v2
- 2 interruptores

Antes de tudo, acho que faz sentido explicar como são as conexões de cada switch com a placa:

Os switches geralmente não são ligados diretamente em pinos individuais da placa. Em vez disso usamos uma **matriz**. Isso permite conectar muito mais teclas usando menos pinos. Por exemplo, com 8 pinos podemos controlar até 15 teclas (3 linhas x 5 colunas).

<img alt="Exemplo de teclas" src="/images/keyboard-matrix-example.png" align="center">

Quando uma tecla é pressionada, um evento é gerado pelo firmware a partir daquela tecla com a linha e a coluna que foi ativada. Com base nesses valores o firmware identifica qual a posição da tecla e executa o comportamento definido naquela posição.

### Protótipo

Fui seguindo a [documentação do ZMK](https://zmk.dev/docs/development/hardware-integration/new-shield) e fiz o build do firmware com apenas duas teclas para validar a minha configuração inicial e também garantir que as placas estavam funcionando, esse foi o keymap inicial:
```
/ {
    keymap {
        compatible = "zmk,keymap";
        default {
            bindings = <
                &kp A
                &kp &bootloader
            >;
        };
    };
};
```

E assim ficou o protótipo. Nesse protótipo as duas teclas fazem parte da mesma coluna (fio amarelo) e os diodos são as linhas, cada um conectado em um pino da placa:

<img alt="Protótipo do teclado" src="/images/keyboard-prototype.png" align="center">

Consegui validar a conexão bluetooth e a configuração do firmware ZMK, tudo estava funcionando. 

A parte externa do teclado eu imprimi em uma impressora 3D. Soldei os diodos nos switches, usei esses fios de cobre que são mais rígidos para fazer as linhas e colunas, e depois soldei com fios de jumper de 24 AWG para conectar cada linha e coluna nos pinos da placa. Ficou assim:

<img alt="Parte interna do teclado" src="/images/keyboard-internal-wires.png" align="center">

Por fim, imprimi os keycaps e a parte de baixo, e foi assim que ficou o teclado:

<img alt="Teclado completo" src="/images/keyboard-complete.png" align="center">

Por ser um teclado com poucas teclas, é mais díficil planejar o layout e as combinações de teclas de forma que a digitação continue eficiente e confortável, mas consegui chegar em uma configuração que ficou boa para mim. Essa é a primeira camada do layout:

<img alt="Primeira camada do teclado" src="/images/keyboard-first-layer.png" align="center">

[Esse é o layout completo com todas as camadas](/images/keyboard-full-layout.svg)

## Links Úteis

- [ZMK - New Keyboard Shield](https://zmk.dev/docs/development/hardware-integration/new-shield)
- [How a Key Matrix Work](https://pcbheaven.com/wikipages/How_Key_Matrices_Works/)
