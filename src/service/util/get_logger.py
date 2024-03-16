import os
import logging
from logging.handlers import TimedRotatingFileHandler


def get_logger():
    if not os.path.exists(".logs"):
        os.makedirs(".logs")

    handler = TimedRotatingFileHandler(
        ".logs/app.log", when="midnight", interval=1, backupCount=5
    )
    handler.setLevel(logging.DEBUG)  # Set the logging level for the handler
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    handler.setFormatter(formatter)

    logger = logging.getLogger("rabbitmq_tests")
    logger.setLevel(logging.DEBUG)  # Set the logging level
    logger.addHandler(handler)

    console_logger = logging.StreamHandler()
    console_logger.setLevel(logging.DEBUG)
    console_logger.setFormatter(formatter)
    logger.addHandler(console_logger)
    return logger
