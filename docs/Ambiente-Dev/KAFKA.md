---
layout: default
title: "KAFKA"
nav_order: 2
---

# KAFKA

## ✅ Etapa 1 – Configurar o produtor no `gestao-pelada`


### 📌 1. Adicionar dependência do Kafka no `pom.xml`


```xml
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```


---


### 📌 2. Configurar o `application.properties`


```plain text
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.apache.kafka.common.serialization.StringSerializer
```

> Obs: se quiser, depois podemos usar JsonSerializer para enviar objetos estruturados.

---


### 📌 3. Criar a classe de evento `JogadorCadastradoEvent`


```java
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
JogadorCadastradoEvent evento = new JogadorCadastradoEvent();
evento.setNome(jogador.getNome());
evento.setEmail("seuemail@destino.com"); // ou jogador.getEmail() se for individual
evento.setNomeSorteio(sorteio.getNome());
evento.setData(LocalDate.now());

kafkaProducerService.enviarEventoJogador(evento);
```


---


Quando isso estiver pronto, seu sistema já estará **enviando eventos Kafka sempre que um jogador for cadastrado**.
