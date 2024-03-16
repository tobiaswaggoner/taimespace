class MessageBrokerConfiguration:

    host: str
    port: int
    username: str
    password: str
    exchange_name: str

    def __init__(
        self, host: str, port: int, username: str, password: str, exchange_name: str
    ):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.exchange_name = exchange_name
