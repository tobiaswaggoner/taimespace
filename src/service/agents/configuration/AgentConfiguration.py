class AgentConfiguration:
    agent_name: str
    routing_key_patterns: list[str]
    system_message: str
    model: str

    def __init__(
        self,
        agent_name: str,
        routing_key_patterns: list[str],
        system_message: str,
        model: str,
    ):
        self.agent_name = agent_name
        self.routing_key_patterns = routing_key_patterns
        self.system_message = system_message
        self.model = model
