class InferenceRequestedMessage:
    def __init__(self, modelId, data):
        self.modelId = modelId
        self.data = data
