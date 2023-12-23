import {IpcMainInvokeEvent} from "electron";
import "openai/shims/node"
import OpenAIApi from "openai"
import {config} from "./config";
import {NoAPIKeyError} from "./errors";
import {logger} from "./logger";


export async function handleExplain(_event:  IpcMainInvokeEvent, context: string, phrases: string[]){
    try{
        const explainer = new GPTExplainer(context,phrases)
        return explainer.getExplanation()
    }catch (error){
        if (error instanceof NoAPIKeyError){
            return "No openAI API key is defined, please define it first"
        }else{
            // system error, print to log
            logger.error((error as Error).message)
        }
    }
}


export class GPTExplainer {
    context: string;
    phrases: string[];
    private readonly prompt: string;
    private connector: OpenAIApi

    constructor(_context: string, _phrases:string[]) {
        this.context = _context;
        this.phrases = _phrases;
        this.prompt = this.generatePrompt()

        if(!config.APIKEY){
            throw new NoAPIKeyError()
        }
        this.connector = new OpenAIApi({
            apiKey: config.APIKEY
        })
    }

    private generatePrompt(){
        const strPhrases = this.phrases.join("and")
        let prompt = "What do \"" + strPhrases + "\" mean in \"" + this.context + "\"? "
        prompt += "Use as little token as possible to explain"
        return prompt
    }


    async getExplanation(){
        const completion = await this.connector.chat.completions.create({
            messages:[{role: 'user', content: this.prompt}],
            model: config.MODEL
        })
        const responseMessage = completion.choices[0].message

        const totalToken = completion.usage?.total_tokens
        logger.info("total token usage:" + totalToken)

        return responseMessage.content
    }

}
