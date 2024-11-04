<template>
	<el-container>
		<el-header class="title"><span><!-- {{experiment.experiment_topic}} --></span></el-header>
		<el-container v-for="(item,index) in experiment.guide_pages" :key="index" v-if="item.id==showPage">
			<!-- {{item.id}} | {{item.word_limit_max}} | {{item.word_limit_min}} -->
			<el-main>
				<el-card class="center-view">
					<scroll-view class="page-content" scroll-y="true">
						<!-- 当前页的content内容 -->
						<view class="index-content" v-if="indexPage==item.id">
							<view class="item-content" v-html="item.content"></view>
							<view class="remark">
								<view v-html="bottom"></view>
							</view>
						</view>
						<view v-else v-html="item.content"></view>

						<!-- 是否显示前一页的内容 -->
						<!-- <view v-if="getChatForm"> -->
						<view v-if="item.get_chat_from">
							<!-- 前一页的content内容 -->
							<!-- <view v-html="getChatForm.content"  v-if="item.get_chat_from"></view> -->
							<!-- 前一页是否有对话 -->
							<!-- <div class="message-box" v-if="getChatForm.chat"> -->
							<div class="message-box" v-if="item.get_chat_from">
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
							</div>
						</view>

						<!-- 当前页是否显示对话框，只有对话页显示对话框 -->
						<div class="message-box" v-if="item.chat">
							<view class="message-item" :class="{last:chatIndex==messageList.length-1}"
								v-for="(chat,chatIndex) in messageList" :key="chatIndex">
								<!-- gpt的回答 -->
								<template v-if="chat.user=='gpt'">
									<el-button class="name-button" type="primary" circle>AI</el-button>
									<MDParserHighlight :resource="chat.message"></MDParserHighlight>
								</template>
								<!-- 你的提问 -->
								<template v-else>
									<el-button class="name-button" type="warning" circle>U</el-button>
									<view v-html="chat.message"></view>
								</template>
							</view>
							<!-- gpt回答问题比较慢，所以加一个loading效果提示用户 -->
							<view class="message-item" v-if="posting=='start'">
								<el-button class="name-button" type="primary" circle>AI</el-button>
								<view class="tip" data-text="我正在思考中...请您耐心等待">我正在思考中...请您耐心等待</view>
							</view>
							<!-- 如果gpt回答失败，提示用户重新发起提问 -->
							<view class="message-item" v-if="posting=='fail'">
								<el-button class="name-button" type="primary" circle>AI</el-button>
								<view>服务器开小差了，请您重新提问</view>
							</view>
							<view class="message-item" v-if="posting=='ing'">
								<el-button class="name-button" type="primary" circle>AI</el-button>
								<view>{{tempMsg}}</view>
							</view>
							<!-- 只有提问次数大于0，或者不限制提问次数的时候才显示ChatGPT聊天框 -->
							<!-- <view v-if="chatTimes > 0 || (item.chat_times==0&&disabledBtn)"> -->
							<view v-if="chatTimes > 0 || (item.chat_times==0)">
								<el-alert v-if="item.chat_tips" style="margin-bottom: 10px;" :title="item.chat_tips"
									type="warning" effect="dark" center show-icon :closable="false">
								</el-alert>
								<el-input type="textarea" :rows="2" placeholder="ChatGPT聊天框"
									v-model="chat.message"></el-input>
								<view class="post-button">
									<el-button :loading="posting=='start'" type="primary"
										@click="chatPostWs(item.id,chat.message,item)" icon="el-icon-s-promotion"
										size="small" round></el-button>
								</view>
							</view>
						</div>
						<div style="margin-top: 10px;width:95%;"
							v-if="(!item.chat && item.answer_page) ||(item.chat && answerShow && item.answer_page)">
							<el-alert style="margin-bottom: 10px;"
								:title="`您共有${item.answer_time_countdown}s写出自己的想法，超过时间终止作答。`" type="warning"
								effect="dark" center show-icon :closable="false">
							</el-alert>
							<el-input type="textarea" :disabled="disabledAnswer" :rows="2" placeholder="请在此处填写您的创意"
								v-model="answer">
							</el-input>
						</div>
					</scroll-view>
				</el-card>
				<div class="time" v-if="item.chat && item.chat_times">
					剩余提问次数：{{chatTimes}}
				</div>
				<div class="time"
					v-if="(!item.chat && item.answer_time_countdown) ||(item.chat && answerShow && item.answer_time_countdown)">
					回答提交剩余时间：<uni-countdown :show-day="false" :second="debug?2:item.answer_time_countdown" color="red"
						@timeup="timeup(item.next_page,item)"></uni-countdown>
				</div>
				<div class="time" v-if="item.countdown">
					页面最短停留时间：<uni-countdown :show-day="false" :second="debug?2:item.countdown" color="red"
						@timeup="goon()"></uni-countdown>
				</div>
			</el-main>
			<el-footer class="footer">
				<el-button type="primary" v-if="item.next_button==1 && item.answer_page"
					@click="answerSubmit(experiment.id, item, item.word_limit_min, item.word_limit_max)"
					:disabled="disabledAnswer">{{item.next_page==0?'完成':'提交'}}</el-button>
				<el-button type="primary" v-if="item.next_button==1 && !item.answer_page"
					@click="gotoYesOrNo(item.next_page,item)"
					:disabled="disabledBtn">{{item.next_page==0?'完成':'下一页'}}</el-button>

				<template v-if="item.yes_or_no">
					<el-button type="success" round @click="gotoYesOrNo(item.yes_page,item)"
						:disabled="disabledBtn">了解</el-button>
					<el-button type="danger" round @click="gotoYesOrNo(item.no_page,item)"
						:disabled="disabledBtn">不了解（进入教程）</el-button>
				</template>
			</el-footer>
		</el-container>
	</el-container>
</template>

<script>
	import MDParserHighlight from '@/components/cmder-MDParserHighlight/index.vue'
	import {
		experimentApi,
		chatApi,
		answerApi
	} from '@/api/api.js'
	export default {
		data() {
			return {
				debug: false,
				indexPage: 0,
				remark: '本站仅做科研用途，我们郑重承诺您使用中涉及的所有数据和回答只用于学术研究，对您提供的信息我们将匿名处理并严格保密，其他个人、组织或企业并不会得知您个人回答的情况。答案并无对错之分，请您依据自身实际情况填写即可，您的回答对我们的研究将会有非常大的帮助。',
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
					message: "你好，我是ChatGPT，一个由OpenAI训练的的大型语言模型，我旨在回答并解决人们的任何问题，并且可以使用多种语言与人交流。",
					// time: moment()
				}],
				answer: '',
				disabledAnswer: false,
				posting: false,
				tempMsg: '',
				answerShow: false,
				chatTimes: 0,
				getChatForm: null,
				bottom: ''
			};
		},
		components: {
			MDParserHighlight
		},
		onLoad(option) {
			this.getExperiment(option.id)
			this.getinfo()
		},
		methods: {
			getinfo() {
				uni.request({
					url: 'http://119.91.192.119:8089/api/basic_info',
					method: 'GET',
					success: (res) => {
						console.log(res.data.login_title);
						// this.title = res.data.login_title
						this.bottom = res.data.index_bottom_tips
					}
				})
			},
			chatPostWs(id, message, item) {
				this.posting = 'start'
				this.messageList.push({
					user: 'me',
					message
				})
				this.chat.message = ''
				const token = uni.getStorageSync('token');
				// const id = this.chat.id;
				const eid = this.experiment.id
				uni.connectSocket({
					url: `ws://119.91.192.119:8089/api/chat/event_stream?token=${token}&message=${message}&id=${eid}`,
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
				var _item = item
				uni.onSocketMessage(function(res) {
					console.log('收到服务器内容：' + res.data);
					_this.posting = 'ing'
					_this.tempMsg = _this.tempMsg + res.data.replace(/\"/g, '').trim()
				});

				uni.onSocketClose(function(res) {
					console.log('WebSocket 已关闭！');
					_this.messageList.push({
						user: 'gpt',
						message: _this.tempMsg
					})
					_this.posting = 'success'
					_this.tempMsg = ''
					if (_this.chatTimes > 0) {
						_this.chatTimes--
					}
					// if (_this.chatTimes == 0 && _item.chat_times > 0) {
					if (_this.chatTimes == _item.chat_times - 1) {
						_this.disabledBtn = false
					}
				});
			},
			answerSubmit(id, item, min, max) {
				console.log(id, item, min, max);
				console.log(this.answer);
				console.log(this.answer.length);

				if (this.answer.length < min) {
					uni.showToast({
						title: `不能少于${min}个字`,
						icon: 'none'
					})
					return;
				}

				if (this.answer.length > max) {
					uni.showToast({
						title: `不能大于${max}个字`,
						icon: 'none'
					})
					return;
				}


				if (!this.answer) {
					console.log('不能为空');
					uni.showToast({
						title: '请填写您的创意',
						icon: 'none'
					})
					return;
				}

				const loading = this.$loading({
					lock: true,
					text: '提交中...',
					spinner: 'el-icon-loading',
					background: 'rgba(0, 0, 0, 0.7)'
				});
				answerApi({
					id: id,
					answer: this.answer
				}).then(res => {
					// this.disabledAnswer = true
					this.answer = ''
					this.$message.success('提交成功')
					setTimeout(() => {
						this.gotoYesOrNo(item.next_page, item)
					}, 300)
				}).finally(() => {
					loading.close();
				})
			},
			toQuestion() {
				uni.redirectTo({
					url: '/pages/question/question'
				})
			},
			chatPost(id, message, item) {
				this.posting = 'start'
				this.messageList.push({
					user: 'me',
					message
				})
				this.chat.message = ''
				chatApi({
					id,
					message
				}).then(res => {
					this.messageList.push({
						user: 'gpt',
						message: res.reply
					})
					if (this.chatTimes > 0) {
						this.chatTimes--
					}
					// if (this.chatTimes == 0 && item.chat_times > 0) {
					if (this.chatTimes == item.chat_times - 1) {
						this.disabledBtn = false
					}
					this.posting = 'success'
				}).catch(() => {
					this.posting = 'fail'
				})
			},
			timeup(id, item) {
				// this.disabledAnswer = true
				this.answerSubmit(id, item)
			},
			goon(e) {
				this.disabledBtn = false
			},
			gotoYesOrNo(id, item) {
				if (id == -1) {
					uni.redirectTo({
						url: '/pages/answer/answer'
					})
				} else if (id == 0) {
					this.toQuestion()
				} else {
					this.goto(id, item)
				}
			},
			goto(id, item) {
				if (item && item.chat && item.answer_page && !this.answerShow) {
					return this.answerShow = true
				}
				if (!item.save_chat_info) {
					this.messageList = [{
						user: 'gpt',
						message: "你好，我是ChatGPT，一个由OpenAI训练的的大型语言模型，我旨在回答并解决人们的任何问题，并且可以使用多种语言与人交流。",
					}]
				}
				this.answerShow = false
				this.showPage = id;
				this.experiment.guide_pages.map(item => {
					if (item.id == id) {
						this.chatTimes = item.chat_times
						if (item.countdown) {
							this.disabledBtn = true
						}
						if (item.chat) {
							this.disabledBtn = true
						}
						if (item.get_chat_from) {
							this.getChatForm = this.experiment.guide_pages.find(page => {
								return page.id == item.get_chat_from
							})
						} else {
							this.getChatForm = null
						}
					}
				})
			},
			getExperiment(id) {
				experimentApi({
					id
				}).then(res => {
					this.experiment = res.experiment
					if (this.experiment.guide_pages && this.experiment.guide_pages.length) {
						this.showPage = this.experiment.guide_pages[0].id
						this.indexPage = this.experiment.guide_pages[0].id
					}
					// 如果id是0,直接跳聊天
					if (this.experiment.id == 0) {
						uni.redirectTo({
							url: '/pages/answer/answer'
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.index-content {
		height: 100%;
		display: flex;
		flex-direction: column;

		.item-content {
			flex: 1;
		}
	}

	.remark {
		font-size: 12px;
		color: #555555;
		line-height: 1.5;
		text-indent: 2em;

		.first-text {
			color: #f56c6c;
		}
	}

	.title {
		text-align: center;
		line-height: 60px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		background-color: #ffffff;
	}

	.page-content {
		height: calc(100vh - 300px);
	}

	.center-view {
		max-width: 980px;
		margin: 0 auto;
		user-select: none !important;
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
		height: 35px;
		width: 35px;
		border-radius: 10px;
		margin-right: 10px;
	}

	.footer {
		line-height: 60px;
		text-align: center;
		background-color: #ffffff;
	}

	.message-box {
		padding-bottom: 15px;
		width: 95%;
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