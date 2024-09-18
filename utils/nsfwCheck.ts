// NSFW内容检测初始化
import * as tf from '@tensorflow/tfjs'
import * as nsfwjs from 'nsfwjs'

// 启用生产模式以优化TensorFlow.js性能
tf.enableProdMode()

/**
 * NSFW内容预测器类
 * 用于加载模型和对图像进行NSFW内容预测
 */
class NSFWPredictor {
    model: nsfwjs.NSFWJS | null = null

    constructor() {
        // 构造函数中初始化模型并异步加载
        this.model = null
        this.loadModel()
    }

    /**
     * 异步加载NSFW检测模型
     */
    async loadModel() {
        try {
            // 加载预训练的NSFW检测模型
            this.model = await nsfwjs.load(
                'https://www.redesigner.io/model/',
                // @ts-ignore
                { type: 'graph' },
            )
        } catch (e) {
            // 捕获并记录加载模型时的错误
            console.log(e)
        }
    }

    /**
     * 对给定的图像元素进行NSFW内容预测
     * @param element 图像元素
     * @param guesses 预测结果的条数，默认为5
     * @returns 返回预测结果
     */
    predict(element: HTMLImageElement, guesses: number = 5) {
        if (!this.model) {
            // 如果模型未加载，抛出错误
            throw new Error('Something went wrong. Please try again later.')
        }
        // 返回模型对图像的分类结果
        return this.model?.classify(element, guesses)
    }

    /**
     * 对给定的文件进行NSFW内容预测
     * @param file 图像文件
     * @param guesses 预测结果的条数，默认为5
     * @returns 返回预测结果
     */
    async predictImage(file: File, guesses: number = 5) {
        const url = URL.createObjectURL(file)
        try {
            const img = document.createElement('img')
            img.width = 400
            img.height = 400
            img.src = url
            // 使用Promise处理图像加载和预测异步流程
            return await new Promise<nsfwjs.predictionType[]>((resolve, reject) => {
                img.onload = async () => {
                    const predictions = await this.predict(img, guesses)
                    URL.revokeObjectURL(url)
                    resolve(predictions)
                }
            })
        } catch (e) {
            // 捕获并记录预测过程中的错误
            console.error(e)
            URL.revokeObjectURL(url)
            throw e
        }
    }

    /**
     * 检查给定文件是否为安全图像
     * @param file 图像文件
     * @returns 返回布尔值，表示图像是否安全
     */
    async isSafeImage(file: File) {
        try {
            const predictions = await this.predictImage(file, 3)
            const pornPrediction = predictions.find(p => p.className === 'Porn')
            const hentaiPrediction = predictions.find(p => p.className === 'Hentai')

            // 如果找不到这些预测或其概率低于25%，则认为图像是安全的
            return !(
                pornPrediction?.probability > 0.25 || hentaiPrediction?.probability > 0.25
            )
        } catch (e) {
            // 捕获并记录检查过程中的错误
            console.error(e)
            return false
        }
    }
}

// 导出默认的NSFWPredictor实例
export default new NSFWPredictor()