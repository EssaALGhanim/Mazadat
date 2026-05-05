package org.example.mazadat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MAzadatApplication {

    public static void main(String[] args) {
        SpringApplication.run(MAzadatApplication.class, args);
    }

}
