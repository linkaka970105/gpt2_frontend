<template>
	<view class="view-box">
		<!-- {{chat.message}} -->
		<el-card class="center-view">
			<scroll-view class="page-content" scroll-y="true">
				<div class="message-box">
					<view class="message-item" :class="{last:chatIndex==messageList.length-1}"
						v-for="(chat,chatIndex) in messageList" :key="chatIndex">
						<template v-if="chat.user=='gpt'">
							<el-button class="name-button" type="primary" circle>AI</el-button>
							<MDParserHighlight :resource="chat.message"></MDParserHighlight>
						</template>
						<template v-else>
							<el-button class="name-button" type="warning" circle>U</el-button>
							<view v-html="chat.message"></view>
						</template>
					</view>
					<view class="message-item" v-if="posting=='start'">
						<el-button class="name-button" type="primary" circle>AI</el-button>
						<view class="tip" data-text="我正在思考中...请您耐心等待">我正在思考中...请您耐心等待</view>
					</view>
					<view class="message-item" v-if="posting=='fail'">
						<el-button class="name-button" type="primary" circle>AI</el-button>
						<view>服务器开小差了，请您重新提问</view>
					</view>
					<view class="message-item" v-if="posting=='ing'">
						<el-button class="name-button" type="primary" circle>AI</el-button>
						<view>{{tempMsg}}</view>
					</view>
					<el-input type="textarea" :rows="2" placeholder="ChatGPT聊天框" v-model="chat.message"></el-input>
					<view class="post-button">
						<el-button :loading="posting=='start'" type="primary" @click="chatPostWs(chat.message)"
							icon="el-icon-s-promotion" size="small" round></el-button>
					</view>
				</div>
			</scroll-view>
		</el-card>

	</view>
</template>

<script>
	import MDParserHighlight from '@/components/cmder-MDParserHighlight/index.vue'
	import {
		experimentApi,
		chatApi
	} from '@/api/api.js'
	export default {
		data() {
			return {
				radio: '',
				experiment: {},
				showPage: 1,
				disabledBtn: true,
				chat: {
					id: 0,
					message: ''
				},
				messageList: [{
					user: 'gpt',
					message: "你好，我是ChatGPT，一个由OpenAI训练的的大型语言模型，我旨在回答并解决人们的任何问题，并且可以使用多种语言与人交流。"
				}],
				answer: '',
				posting: false,
				tempMsg: '',
				timer: null
			};
		},
		components: {
			MDParserHighlight
		},
		onLoad() {
			this.timer = setInterval(function() {
				this.getExperiment()
			}.bind(this), 1000 * 60 * 5);
			// console.log('time',this.timer);
			this.timer
		},
		methods: {
			getExperiment(id) {
				experimentApi({
					id
				}).then(res => {
					// 如果guide_pages有内容,直接跳首页
					if (res.experiment.guide_pages !== null) {
						clearInterval(this.timer)
						uni.redirectTo({
							url: '/pages/test/test'
						})
					}
				})
			},
			chatPostWs(message) {
				this.posting = 'start'
				this.messageList.push({
					user: 'me',
					message
				})
				this.chat.message = ''
				const token = uni.getStorageSync('token');
				const id = this.chat.id;
				uni.connectSocket({
					url: `ws://119.91.192.119:8089/api/chat/event_stream?token=${token}&message=${message}`,
					method: 'GET',
					success: res => {
						console.log("res:", res);
					},
					fail: err => {
						console.log("err:", err);
					}
				});

				uni.onSocketOpen(function(res) {
					console.log('WebSocket连接已打开！', res);
				});
				var _this = this
				uni.onSocketMessage(function(res) {
					console.log('收到服务器内容：' + res.data);
					_this.posting = 'ing'
					// _this.tempMsg = _this.tempMsg + res.data.replace(/\"/g,'').trim()
					_this.tempMsg = _this.tempMsg + res.data
					// _this.$forceUpdate()
					// console.log('messageList：' + _this.messageList);
					// _this.messageList.push({
					// 	user: 'gpt',
					// 	message: res.data
					// })
					// _this.posting = 'success'
				});

				uni.onSocketClose(function(res) {
					console.log('WebSocket 已关闭！');
					_this.messageList.push({
						user: 'gpt',
						message: _this.tempMsg
					})
					_this.posting = 'success'
					_this.tempMsg = ''
				});
			},
			chatPost(message) {
				this.posting = 'start'
				this.messageList.push({
					user: 'me',
					message
				})
				this.chat.message = ''
				chatApi({
					id: 0,
					message
				}).then(res => {
					this.messageList.push({
						user: 'gpt',
						message: res.reply
					})
					this.posting = 'success'
				}).catch(() => {
					this.posting = 'fail'
				})
			},
			timeup(e) {
				this.disabledBtn = true
			},
			goon(e) {
				this.disabledBtn = false
			},
			goto(id) {
				this.showPage = id;
				this.experiment.guide_pages.map(item => {
					if (item.id == id) {
						console.log(item.id);
						if (item.countdown) {
							this.disabledBtn = true
						}
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	html {
		// -webkit-user-select: all !important;
		// user-select: all !important;
	}

	.view-box {
		height: 100vh;
		width: 100vw;
		overflow: hidden;
	}

	.title {
		text-align: center;
		line-height: 60px;
	}

	.page-content {
		height: calc(100vh - 120px);
	}

	.center-view {
		max-width: 980px;
		margin: 30px 20px auto;
		box-sizing: border-box;
	}

	.time {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-top: 20px;
	}

	.post-button {
		text-align: right;
		margin-top: 10px;
	}

	.name-button {
		flex-shrink: 0;
		// height: 35px;
		// width: 35px;
		// border-radius: 10px;
		margin-right: 10px;
	}

	.footer {
		line-height: 60px;
		text-align: center;
	}

	.message-box {
		padding-bottom: 15px;
	}

	.message-item {
		line-height: 1.5;
		display: flex;
		align-items: baseline;
		padding: 12px 0;
		border-bottom: 1px solid #ddd;
	}

	.message-item.last {
		border-bottom: none;
	}

	.chat-user {
		margin-right: 10px;
	}

	.tip {
		position: relative;
		font-size: 14px;
		color: #606266;
		text-transform: uppercase;
		// -webkit-text-stroke: 0.3vw #383d52;
	}

	.tip:before {
		content: attr(data-text);
		position: absolute;
		top: 0;
		left: 0;
		width: 0;
		height: 100%;
		color: #409EFF;
		overflow: hidden;
		// -webkit-text-stroke: 0vw #383d52;
		border-right: 2px solid #409EFF;
		animation: animate 4s linear infinite;
	}

	@keyframes animate {

		0%,
		10%,
		100% {
			width: 0;
		}

		70%,
		90% {
			width: 100%;
		}
	}
</style>