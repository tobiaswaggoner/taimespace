import OpenAI from "openai";
import { ChatCompletionCreateParams, ChatCompletionMessageParam } from "openai/resources";

class OpenAICompletion {

    private openai: OpenAI;
    private messages: ChatCompletionMessageParam[] = [];

    constructor() {
        this.openai = new OpenAI();
        this.messages.push({
            role: "system",
            content: "You are a helpful assistant."
        });
    }

    async complete(prompt: string): Promise<string> {
        this.messages.push(
            {
                role: "user",
                content: prompt
            });

        const params: ChatCompletionCreateParams = {
            model: "gpt-3.5-turbo",
            messages: this.messages,
            max_tokens: 150
        }

        const gptResponse = await this.openai.chat.completions.create(params);
        const response = gptResponse.choices[0].message;
        if (response) {
            this.messages.push(response);
        }
        return response.content + "";
    }
}

export default OpenAICompletion;

