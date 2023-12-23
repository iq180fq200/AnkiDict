import {GPTExplainer} from "../electron/explainer";
import {config} from "../electron/config";
import {logger} from "../electron/logger";

describe('testing chatGPT explainer', () => {
    test('integration test: get result from chatGPT', async () => {
        if (!process.env.CHATGPT_KEY) {
            logger.error("No CHATGPT_KEY environment variable for the test process, cannot test")
            return
        }
        config.APIKEY = process.env.CHATGPT_KEY!
        const explainer = new GPTExplainer("Cruise passengers return to port in Charleston and find their cars flooded", ["Cruise"])
        const explain = await explainer.getExplanation()
        expect(explain !== null).toBe(true);
    });
});