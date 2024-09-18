import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import requestIp from 'request-ip'

// TODO: to check what happens if daily limit of 10k is reached
// should not do rate limit check once 10k is reached
/**
 * 初始化速率限制器
 * 通过Redis从环境变量中获取配置，使用滑动窗口算法来限制请求速率，并启用分析功能
 * 此配置用于控制请求的速率，允许每30秒内最多有5个请求
 */
const ratelimit = new Ratelimit({
	redis: Redis.fromEnv(), // 使用环境变量中配置的Redis实例
	limiter: Ratelimit.slidingWindow(5, '30 s'), // 使用滑动窗口算法，每30秒内最多允许5个请求
	analytics: true, // 启用分析功能，以便跟踪和监控速率限制的效果
});

type Input = {
	image: string
}

/**
 * 处理POST请求以生成图像
 * @param request 请求对象，包含生成图像所需的参数
 * @returns 返回生成的图像URL或错误信息
 */
export async function POST(request: Request) {
    // 使用客户端IP地址进行限流
    const identifier = requestIp.getClientIp({ headers: {} })
    // 创建一个新的Headers对象，用于添加自定义的限流头信息
    const newHeaders = new Headers(request.headers)

    // 条件性执行限流检查，可以通过环境变量在需要时禁用
    if (
        ratelimit &&
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
        // 执行限流并获取结果
        const { success, limit, remaining } = await ratelimit.limit(identifier!)

        // 添加自定义限流头信息
        newHeaders.set('x-RateLimit-Limit', limit.toString())
        newHeaders.set('x-RateLimit-Remaining', remaining.toString())

        // 如果限流失败，返回429状态码
        if (!success) {
            return NextResponse.json({ headers: newHeaders, status: 429 })
        }
    }

    // 解析请求体中的JSON数据
    const req = await request.json()

    // 提取请求参数
    const { imageUrl, roomType, roomTheme, buildingType, buildingTheme } = req

    // 开始图像生成过程
    const initResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
            version:
                '435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117',
            input: {
                image: imageUrl,
                prompt:
                    roomType === 'Gaming Room'
                        ? 'a room for gaming with gaming computers, gaming consoles, and gaming chairs'
                        : roomType
                        ? `a ${roomTheme.toLowerCase()} ${roomType.toLowerCase()}`
                        : `a ${buildingTheme.toLowerCase()} ${buildingType.toLowerCase()} `,
                a_prompt:
                    'best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning',
                n_prompt:
                    'longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality',
            },
        }),
    })

    // 定义初始化响应的类型
    type InitResponseJSON = {
        completed_at: null
        created_at: Date
        error: null
        id: string
        input: Input
        logs: null
        metrics: {}
        output: null
        started_at: null
        status: string
        version: string
    }

    // 解析初始化响应的JSON数据
    const initResponseJson: InitResponseJSON = await initResponse.json()

    // 提取预测ID
    const { id } = initResponseJson

    // 轮询API直到图像生成完成
    let predictedImageUrls = null
    type ImageResponseJSON = Pick<
        InitResponseJSON,
        'id' | 'input' | 'output' | 'status'
    >

    while (!predictedImageUrls) {
        let imageResponse = await fetch(
            `https://api.replicate.com/v1/predictions/${id}`,
            {
                headers: {
                    Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
                },
            },
        )
        let imageResponseJson: ImageResponseJSON = await imageResponse.json()
        console.log('imageResponseJson', JSON.stringify(imageResponseJson))
        if (imageResponseJson.status === 'succeeded') {
            predictedImageUrls = imageResponseJson.output
        } else if (imageResponseJson.status === 'failed') {
            throw new Error('Image generation failed')
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }

    // 返回生成的图像URL
    console.log('predictedImageUrl', predictedImageUrls)
    return NextResponse.json({
        predictedImageUrl: predictedImageUrls[1] ?? 'Failed to generate image',
    })
}
