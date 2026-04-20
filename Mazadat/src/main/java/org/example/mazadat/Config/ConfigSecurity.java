package org.example.mazadat.Config;


import lombok.RequiredArgsConstructor;
import org.example.mazadat.Service.MyUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class ConfigSecurity {

    private final MyUserDetailsService myUserDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider(myUserDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder);
        return daoAuthenticationProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, DaoAuthenticationProvider daoAuthenticationProvider) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authenticationProvider(daoAuthenticationProvider)
            .authorizeHttpRequests(auth -> auth
                // Allow all OPTIONS requests (CORS preflight)
                    .requestMatchers("OPTIONS", "/**").permitAll()
                // Admin endpoints
                    .requestMatchers("/api/v1/user/get/all").hasAuthority("ADMIN")
                // Auth endpoints (authentication required)
                    .requestMatchers("/api/v1/auth/**").authenticated()
                // Public endpoints (no authentication required)
                    .requestMatchers("/api/v1/buyer/add").permitAll()
                    .requestMatchers("/api/v1/seller/add").permitAll()
                    .requestMatchers("/api/v1/auction/get/all").permitAll()
                    .requestMatchers("/api/v1/auction/search").permitAll()
                    .requestMatchers("/api/v1/bid/get/all").permitAll()
                    .requestMatchers("/api/v1/seller/get/all").permitAll()
                    .requestMatchers("/api/v1/auctionhouse/get/all").permitAll()
                    .requestMatchers("/api/v1/receipt/get/all").permitAll()
                // Seller endpoints (authenticated - sellers)
                    .requestMatchers("/api/v1/auction/add").authenticated()
                    .requestMatchers("/api/v1/auction/update/**").authenticated()
                    .requestMatchers("/api/v1/auction/delete/**").authenticated()
                    .requestMatchers("/api/v1/auctionhouse/add").authenticated()
                    .requestMatchers("/api/v1/auctionhouse/update").authenticated()
                    .requestMatchers("/api/v1/seller/update").authenticated()
                    .requestMatchers("/api/v1/seller/delete").authenticated()
                    .requestMatchers("/api/v1/seller/delete/**").authenticated()
                // Buyer endpoints (authenticated - buyers)
                    .requestMatchers("/api/v1/bid/add").authenticated()
                    .requestMatchers("/api/v1/receipt/generate/**").authenticated()
                    .requestMatchers("/api/v1/receipt/delete/**").authenticated()
                .anyRequest().authenticated()
            )
            .logout(logout -> logout
                .logoutUrl("/api/v1/auth/logout")
                .deleteCookies("JSESSIONID")
                .invalidateHttpSession(true)
            )
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}

