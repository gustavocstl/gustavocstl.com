---
slug: "/usando-imagens-locais-do-docker-no-seu-cluster-kind"
date: "2022-04-07"
title: "Usando imagens locais do Docker no seu cluster Kind"
description: "Quando comecei a testar algumas coisas com o kind me deparei com o seguinte problema: rodar pods com imagens do docker que estão apenas na minha própria máquina."
---

## O que é o kind?

O kind é uma ferramenta utilizada para rodar clusters kubernetes localmente e ele utiliza containers do docker para fazer isso. É uma ótima ferramenta para você testar e aprender mais sobre kubernetes.

Para saber mais veja o [site oficial](https://kind.sigs.k8s.io/).


## O problema

Quando comecei a testar algumas coisas com o kind me deparei com o seguinte problema: rodar pods com imagens do docker que estão apenas na minha própria máquina. 

Para que você entenda, caso nenhum registro seja especificado, o [kubelet](https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/) que é o responsável por gerenciar os containers dos pods, irá utilizar o [registro público do docker](https://docker.io/library) para procurar a imagem e criar os containers.

Isso é especificado na documentação: [kubernetes - nomes de imagens](https://kubernetes.io/docs/concepts/containers/images/)

Para mostrar o erro vou utilizar como exemplo a declaração abaixo para criar um pod:
```yaml
# pod.yaml 
apiVersion: v1
kind: Pod
metadata:
  name: pod-teste 
spec:
  containers:
  - name: pod-teste 
    image: minha-imagem-local:latest
```

Assim que solicito a criação do pod, veja o que acontece: 
```bash
$ kubectl apply -f pod.yaml

pod/pod-teste create

$ kubectl get pods

NAME        READY   STATUS         RESTARTS   AGE
pod-teste   0/1     ErrImagePull   0          4s
```

Vendo os logs é possível ter mais detalhes do erro, veja que a imagem foi procurada no registro público do docker e não foi encontrada:

**From: kubelet Message: failed to pull and unpack image "docker.io/library/minha-imagem-local:latest"**
```bash
$ kubectl describe pod pod-teste

...
Events:
  Type     Reason     Age               From               Message
  ----     ------     ----              ----               -------
  Normal   Scheduled  21s               default-scheduler  Successfully assigned default/pod-teste to kind-worker
  Normal   BackOff    18s               kubelet            Back-off pulling image "minha-imagem-local:latest"
  Warning  Failed     18s               kubelet            Error: ImagePullBackOff
  Normal   Pulling    6s (x2 over 20s)  kubelet            Pulling image "minha-imagem-local:latest"
  Warning  Failed     4s (x2 over 18s)  kubelet            Failed to pull image "minha-imagem-local:latest": rpc error: code = Unknown desc = failed to pull and unpack image "docker.io/library/minha-imagem-local:latest": failed to resolve reference "docker.io/library/minha-imagem-local:latest": pull access denied, repository does not exist or may require authorization: server message: insufficient_scope: authorization failed
  Warning  Failed     4s (x2 over 18s)  kubelet            Error: ErrImagePull
```

## Carregando as imagens no kind

Para resolver esse problema, o kind possui um comando que possibilita carregar imagens para o contexto do kind.
```bash
kind load docker-image minha-imagem-local:latest --name=kind
```

Essa imagem será adicionada em todos os nós do cluster e como o kind roda em containers do docker, é possível ver como essa imagem foi adicionada lá:
```bash
# listando os containers
$ docker ps

CONTAINER ID   IMAGE                  COMMAND                  CREATED          STATUS          PORTS                       NAMES
8d264e9df89b   kindest/node:v1.23.4   "/usr/local/bin/entr…"   22 minutes ago   Up 22 minutes                               kind-worker-2
0816915a1205   kindest/node:v1.23.4   "/usr/local/bin/entr…"   22 minutes ago   Up 22 minutes   127.0.0.1:55908->6443/tcp   kind-control-plane
aa9aaa0ef16e   kindest/node:v1.23.4   "/usr/local/bin/entr…"   22 minutes ago   Up 22 minutes                               kind-worker

# entrando no container control-plane do cluster
$ docker exec -it kind-control-plane bash

# listando as imagens de dentro do container
root@kind-control-plane:/$ crictl images

IMAGE                                      TAG                  IMAGE ID            SIZE
...
# e essa é a imagem carregada 
docker.io/library/minha-imagem-local       latest               4ca2210cc66b6       17MB
...
```

> O kind utiliza o [containerd](https://www.docker.com/blog/what-is-containerd-runtime/) como implementação do [CRI - Container Runtime Interface](https://kubernetes.io/blog/2016/12/container-runtime-interface-cri-in-kubernetes/), por este motivo não existe o comando `docker` dentro do container que roda o cluster e por isso foi utilizado o [crictl](https://kubernetes.io/docs/tasks/debug-application-cluster/crictl/) para listar as imagens.

Agora podemos fazer o deploy do pod utilizando a seguinte declaração:
```yaml
# pod.yaml 
apiVersion: v1
kind: Pod
metadata:
  name: pod-teste 
spec:
  containers:
  - name: pod-teste 
    image: minha-imagem-local:latest
    imagePullPolicy: Never
```

Veja que foi preciso mudar o yaml, foi adicionado o `imagePullPolicy` com o valor `Never` por que a imagem já foi adicionada ao cluster, não é mais necessário que o kubelet procure a imagem em algum registro externo para fazer o pull, por isso o valor é definido como `Never`. Sendo assim irá subir o container do pod com a imagem que já existe.


```bash
$ kubectl apply -f pod.yaml

pod/pod-teste create

$ kubectl get pods

NAME        READY   STATUS    RESTARTS   AGE
pod-teste   1/1     Running   0          3s

$ kubectl describe pod pod-teste

...
Events:
Type    Reason     Age   From               Message
----    ------     ----  ----               -------
Normal  Scheduled  11s   default-scheduler  Successfully assigned default/pod-teste to kind-worker-2
Normal  Pulled     10s   kubelet            Container image "minha-imagem-local:latest" already present on machine
Normal  Created    10s   kubelet            Created container pod-teste
Normal  Started    10s   kubelet            Started container pod-teste
```

E a mensagem no log:
**Container image "minha-imagem-local:latest" already present on machine**

## Links Úteis

- [Criando um cluster local com kind](https://kind.sigs.k8s.io/docs/user/quick-start/)
- [Ferramentas úteis do kubernetes](https://kubernetes.io/docs/tasks/tools/)
