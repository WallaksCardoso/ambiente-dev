
## ✅ Etapa 1 – Configurar o produtor no `gestao-pelada`


### 📌 1. Adicionar dependência do Kafka no `pom.xml`


```xml
xml
CopiarEditar
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```


---


### 📌 2. Configurar o `application.properties`


```plain text
properties
CopiarEditar
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.apache.kafka.common.serialization.StringSerializer
```

> Obs: se quiser, depois podemos usar JsonSerializer para enviar objetos estruturados.

---


### 📌 3. Criar a classe de evento `JogadorCadastradoEvent`


```java
java
CopiarEditar
package com.pelada_gestao.kafka.event;

import java.time.LocalDate;

public class JogadorCadastradoEvent {
    private String nome;
    private String email;
    private String nomeSorteio;
    private LocalDate data;

    // getters e setters
}
```


---


### 📌 4. Criar `KafkaProducerService`


```java
java
CopiarEditar
package com.pelada_gestao.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pelada_gestao.kafka.event.JogadorCadastradoEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private static final String TOPIC = "jogador-evento";

    public void enviarEventoJogador(JogadorCadastradoEvent event) {
        try {
            String mensagem = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, mensagem);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erro ao converter evento para JSON", e);
        }
    }
}
```


---


### 📌 5. Registrar o producer no fluxo de cadastro


No seu service de jogador, após salvar o jogador no banco:


```java
java
CopiarEditar
JogadorCadastradoEvent evento = new JogadorCadastradoEvent();
evento.setNome(jogador.getNome());
evento.setEmail("seuemail@destino.com"); // ou jogador.getEmail() se for individual
evento.setNomeSorteio(sorteio.getNome());
evento.setData(LocalDate.now());

kafkaProducerService.enviarEventoJogador(evento);
```


---


Quando isso estiver pronto, seu sistema já estará **enviando eventos Kafka sempre que um jogador for cadastrado**.


## Docker

## 📄 **Guia: Rodando a Aplicação com Docker no IntelliJ (Windows)**


### ✅ Pré-requisitos

- Docker Desktop instalado e em execução no Windows
- Projeto com `Dockerfile` configurado
- IntelliJ com o plugin Docker ativado
- Configuração no `application.properties` para uso do H2:

```plain text
properties
CopiarEditar
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
```


---


## ⚙️ 1. **Configurar Docker na IDE**

1. Vá em `File > Settings > Build, Execution, Deployment > Docker`
2. Adicione um novo Docker host com:
    - Tipo: **Docker for Windows**
    - API: `npipe:////./pipe/docker_engine`
3. Clique em **Test Connection** para validar.

---


## 🐳 2. **Criar configuração de execução com Dockerfile**

1. Vá em `Run > Edit Configurations...`
2. Clique no `+` e selecione **Dockerfile**
3. Preencha os campos:

| Campo              | Valor                     |
| ------------------ | ------------------------- |
| **Name**           | Pelada Docker             |
| **Image tag**      | `pelada-gestao`           |
| **Container name** | `pelada-gestao-container` |

1. Clique em **Modify > Bind ports** e adicione:
    - **Host port**: `8080`
    - **Container port**: `8080`
    - Protocolo: `tcp`
2. Clique em **Apply** e depois em **Run**

---


## 🌐 3. **Acessar no navegador**

- **API**: [http://localhost:8080](http://localhost:8080/)
- **Console H2**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)

**Preencha assim no H2:**


| Campo     | Valor                |
| --------- | -------------------- |
| JDBC URL  | `jdbc:h2:mem:testdb` |
| User Name | `sa`                 |
| Password  | _(deixe em branco)_  |


---


## 🛑 4. **Parar e remover o container (se necessário)**


Pelo terminal:


```shell
bash
CopiarEditar
docker stop pelada-gestao-container
docker rm pelada-gestao-container
```


Ou vá na aba **Services > Docker** na IDE, clique com o direito no container e escolha **Stop** e depois **Remove**.


---


## 🔁 Rebuild da imagem


Sempre que mudar código Java e quiser reconstruir a imagem:

1. Clique em **Run > Build 'Dockerfile'**
2. Ou clique em "Run" novamente na configuração de execução


<!-- sync: 2025-10-11T19:19:36.150Z -->
