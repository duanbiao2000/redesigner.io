'use client'

import Image from 'next/image'
import { useCallback, useContext, useState } from 'react'
import { UploadDropzone } from 'react-uploader'
import { Uploader } from 'uploader'
import { downloadImg } from '@redesigner/utils/downloadImg'
import { appendTextToName } from '@redesigner/utils/appendTextToName'
import NSFWPredictor from '@redesigner/utils/nsfwCheck'
import va from '@vercel/analytics'
import { Button } from 'greenhouse-react-ui'
import { useMediaQuery } from '@react-hook/media-query'
import Link from 'next/link'
import { RoomContext } from '@redesigner/app/context/RoomContext'
import { BuildingContext } from '@redesigner/app/context/BuildingContext'
import Loading from './Loading'

if (!process.env.NEXT_PUBLIC_UPLOAD_IO_API_KEY)
	throw new Error('UPLOAD_IO_API_KEY is not set')

const uploader = Uploader({
	apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_IO_API_KEY
		? process.env.NEXT_PUBLIC_UPLOAD_IO_API_KEY
		: 'free',
	// apiKey: 'free',
}) // Your real API key.

// Initialize once (at the start of your app).

const uploaderOptions = {
	maxFileCount: 1,
	maxFileSize: 20 * 1024 * 1024, // 20 MB
	mimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
	editor: { images: { crop: false } },
	// multi: true,

	// Comment out this line & use 'onUpdate' instead of
	// 'onComplete' to have the dropzone close after upload.
	// showFinishButton: true,

	styles: {
		colors: {
			// TODO: Read these from the theme not hard coded
			primary: '#6ea83d',
		},
	},
	onValidate: async (file: File): Promise<string | undefined> => {
		// nsfw check
		let isSafe = false
		try {
			isSafe = await NSFWPredictor.isSafeImage(file)
		} catch (error) {
			console.error(error)
		}
		// track on vercel analytics if not safe with a custom event
		// https://vercel.com/docs/concepts/analytics/custom-events#tracking-an-event
		if (!isSafe) va.track('nsfw-image-blocked')

		return isSafe
			? undefined
			: 'Detected a NSFW image. If this was a mistake, please contact me at https://twitter.com/kirankdash'
	},
}

type PredictResponse = Response & {
	predictedImageUrl?: string
}

export default function UploadComponent() {
	const [loading, setLoading] = useState(false)
	const [imageUrl, setImageUrl] = useState<string | null>('')
	const [predictedImageUrl, setPredictedImageUrl] = useState<string>('')
	const [predictedImageLoaded, setPredictedImageLoaded] = useState(false)
	const [downloading, setDownloading] = useState(false)
	const [imageName, setImageName] = useState<string | null>(null)
	const { roomType, roomTheme } = useContext(RoomContext)
	const { buildingType, buildingTheme } = useContext(BuildingContext)

	const matches = useMediaQuery('only screen and (min-width: 768px)')

	const predictImage = useCallback(
		async (imageUrl: string) => {
			try {
				setLoading(true)
				const response = await fetch('/predict', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						imageUrl,
						roomType,
						roomTheme,
						buildingType,
						buildingTheme,
					}),
				})
				const data: PredictResponse = await response.json()
				if (data.status === 429) {
					throw new Error(
						'Too many uploads recently. Try again in a few minutes.',
					)
				} else if (!data.predictedImageUrl) {
					throw new Error('No predicted image found. Try Again!')
				}
				setPredictedImageUrl(data.predictedImageUrl)
				setLoading(false)
			} catch (error) {
				setLoading(false)
				console.error(error)
			}
		},
		[roomType, roomTheme, buildingType, buildingTheme],
	)

	// 使用useCallback钩子定义一个异步函数downloadPredictedImg，用于下载预测的图像
// 该函数接受一个URL参数，用于指定要下载的图像位置
// 参数：
// - url: 字符串类型，表示图像的URL
// 返回值：无
// 该函数依赖于roomType, roomTheme, buildingType, buildingTheme, imageName这些变量
const downloadPredictedImg = useCallback(
	async (url: string) => {
		// 检查URL、imageName以及roomType或buildingType、roomTheme或buildingTheme是否有效
		// 如果有任何一个条件不满足，抛出错误，提示没有找到预测图像，需要重新尝试
		if (
			!url ||
			!imageName ||
			(!roomType && !buildingType) ||
			(!roomTheme && !buildingTheme)
		)
			throw new Error('No predicted image found. Try Again!')
		
		// 设置downloading状态为true，表示图像下载过程开始
		setDownloading(true)
		
		// 生成文件名，通过在imageName基础上添加roomType或buildingType以及roomTheme或buildingTheme
		// 作为字符串进行拼接
		const fileName = appendTextToName(
			imageName,
			// 选择roomType和buildingType中非空值作为字符串返回
			(roomType ?? buildingType) as string,
			(roomTheme ?? buildingTheme) as string,
		)
		
		// 调用downloadImg函数下载图像，传入URL和文件名
		await downloadImg(url, fileName)
		
		// 下载完成后，设置downloading状态为false，表示下载过程结束
		setDownloading(false)
	},
	// useCallback依赖列表，当这些变量改变时，会创建新的函数
	[roomType, roomTheme, buildingType, buildingTheme, imageName],
)

	const resetFields = () => {
		setImageUrl('')
		setPredictedImageUrl('')
		setPredictedImageLoaded(false)
		setImageName(null)
	}

	return (
		<div className="flex items-center flex-col mx-auto md:mt-12 w-full">
			<p className="mb-3">
				<Button
					disabled={!imageUrl || loading}
					onClick={() => predictImage(imageUrl!)}
				>
					{loading ? 'Redesigning' : 'Redesign'} to: {roomTheme} {roomType}
					{buildingTheme} {buildingType}
				</Button>
			</p>

			{loading && <Loading />}

			{!imageUrl && (
				<UploadDropzone
					uploader={uploader}
					options={uploaderOptions}
					onUpdate={files => {
						if (files.length === 0) {
							console.log('No files selected.')
						} else {
							console.log('File selected: ', files[0].fileUrl)
							setImageName(files[0].originalFile.originalFileName)
							setImageUrl(files[0].fileUrl)
						}
					}}
					// onComplete={(files) => alert(files.map((x) => x.fileUrl).join('\n'))}
					width="600px"
					height="375px"
					className="mx-auto"
				/>
			)}

			<div className="flex flex-col md:flex-row md:gap-10 justify-center align-center">
				<>
					{/* https://upcdn.io/12a1yJB/raw/uploads/2023/06/04/PASSPORT_PHOTO-5wmg.jpg */}
					{imageUrl && (
						<div className="flex flex-col">
							<Image
								src={imageUrl}
								alt="Main image"
								width={matches ? 400 : 300}
								height={matches ? 400 : 300}
							/>

							{!loading && (
								<Button
									onClick={resetFields}
									className="mt-5 md:mt-10"
									size={matches ? 'medium' : 'large'}
									layout="outline"
								>
									Upload another image
								</Button>
							)}
						</div>
					)}
					{predictedImageUrl && (
						<div className="flex flex-col mt-5 md:mt-0">
							<Link href={predictedImageUrl} target="_blank">
								<Image
									src={predictedImageUrl}
									alt="Predicted image"
									width={matches ? 400 : 300}
									height={matches ? 400 : 300}
									onLoad={() => setPredictedImageLoaded(true)}
								/>
							</Link>
							{/* TODO: Fix sonarlint warning */}
							{predictedImageLoaded && (
								<Button
									onClick={() => downloadPredictedImg(predictedImageUrl)}
									className="mt-5 md:mt-10"
									layout="outline"
									size={matches ? 'medium' : 'large'}
								>
									{downloading
										? 'Downloading Predicted Image'
										: 'Download Predicted Image'}
								</Button>
							)}
							{/* https://replicate.delivery/pbxt/FeUR3TUZGM0GFSEx7FgWbkwWXSkwEP3PeMS99emefZKdDETIC/output.png */}
						</div>
					)}
				</>
			</div>
		</div>
	)
}
