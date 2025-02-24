package springbootkotlin.locationsserver.infrastructure.config

import org.springframework.context.annotation.Configuration
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig : WebSocketMessageBrokerConfigurer {

    override fun configureMessageBroker(config: MessageBrokerRegistry) {
        // 클라이언트가 구독할 대상(prefix) 설정, 예: /topic, /queue
        config.enableSimpleBroker("/topic", "/queue")
        // 클라이언트가 서버로 메시지를 보낼 때 사용할 prefix 설정
        config.setApplicationDestinationPrefixes("/app")
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        // 클라이언트가 WebSocket 연결 시 사용할 엔드포인트
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS()
    }
}