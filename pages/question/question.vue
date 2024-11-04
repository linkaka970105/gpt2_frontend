<template>
	<el-container>
		<el-header class="title"><span>{{questionnaire.title}}</span></el-header>
		<el-container>
			<el-main>
				<el-card class="center-view">
					<scroll-view class="page-content" scroll-y="true">
						<view class="remark">
							<div class="text"> <text class="first-text">注：</text> {{remark}}</div>
						</view>
						<el-form ref="formName" label-position="top" label-width="300px" :model="questionnaire">
							<template v-for="(item,questIndex) in questionnaire.questions">
								<el-form-item :prop="`questions.${questIndex}.answer`" v-if="item.type==1"
									:label="`${item.content} (单选)`" :key="item.id"
									:rules="item.is_required==1?{required: true, message: '请选择', trigger: ['blur', 'change']}:{required: false}">
									<el-checkbox-group v-model="item.answer" :max="1">
										<el-checkbox v-for="(choice,index) in item.choice" :label="index+1"
											:key="index">{{choice}}</el-checkbox>
									</el-checkbox-group>
								</el-form-item>
								<el-form-item :prop="`questions.${questIndex}.answer`" v-if="item.type==2"
									:label="`${item.content} (多选)`" :key="item.id"
									:rules="item.is_required==1?{required: true, message: '请选择', trigger: ['blur', 'change']}:{required: false}">
									<el-checkbox-group v-model="item.answer">
										<el-checkbox v-for="(choice,index) in item.choice" :label="index+1"
											:key="index">{{choice}}</el-checkbox>
									</el-checkbox-group>
								</el-form-item>
								<el-form-item :prop="`questions.${questIndex}.text`" v-if="item.type==3"
									:label="item.content" :key="item.id"
									:rules="item.is_required==1?{required: true, message: '请输入', trigger: ['blur', 'change']}:{required: false}">
									<el-input type="textarea" :rows="2" placeholder="请输入" style="width: 80%;"
										v-model="item.text"></el-input>
								</el-form-item>
								<el-form-item :prop="`questions.${questIndex}.scores`" v-if="item.type==4"
									:label="item.content" :key="item.id"
									:rules="item.is_required==1?scoreRule:{required: false}">
									<el-row v-for="(choice,index) in item.choice" :key="index">
										<el-col :span="12" :xs="24">{{choice}}</el-col>
										<el-col :span="12" :xs="24">
											<div class="flex-c">
												<!-- <template v-if="item.score_text && item.score_text.length">
													<view class="text-infomation">
														{{item.score_text[0]}}
													</view>
												</template> -->
												<template v-if="item.score_type==1">
													<el-rate v-model="item.scores[index]"
														:colors="['#99A9BF', '#F7BA2A', '#FF9900']" show-text
														:texts="item.score_text"></el-rate>
												</template>
												<template v-if="item.score_type==2">
													<el-rate v-model="item.scores[index]" :max="7" :low-threshold="3"
														:high-threshold="6" :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
														show-text :texts="item.score_text"></el-rate>
												</template>
												<template v-if="item.score_type==3">
													<el-rate v-model="item.scores[index]" :max="4" :low-threshold="1"
														:high-threshold="4" :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
														show-text :texts="item.score_text"></el-rate>
												</template>
												<!-- <template v-if="item.score_text && item.score_text.length>1">
													<view class="text-infomation">
														{{item.score_text[item.score_text.length-1]}}
													</view>
												</template> -->
											</div>
										</el-col>
									</el-row>
								</el-form-item>
							</template>
						</el-form>
					</scroll-view>
				</el-card>
			</el-main>
			<el-footer class="footer">
				<el-button type="primary" @click="submitForm">提交</el-button>
			</el-footer>
		</el-container>
	</el-container>
</template>

<script>
	import {
		experimentApi,
		chatApi,
		answerQuestionApi
	} from '@/api/api.js'
	export default {
		data() {
			var validatePass = (rule, value, callback) => {
				if (value && value.length) {
					const checkedAll = value.every(item => {
						return item > 0
					})
					if (checkedAll) {
						callback();
					} else {
						callback(new Error('请选择评分'));
					}
				} else {
					callback(new Error('请选择评分'));
				}
			};
			return {
				remark: '本站仅做科研用途，我们郑重承诺您使用中涉及的所有数据和回答只用于学术研究，对您提供的信息我们将匿名处理并严格保密，其他个人、组织或企业并不会得知您个人回答的情况。答案并无对错之分，请您依据自身实际情况填写即可，您的回答对我们的研究将会有非常大的帮助。',
				radio: '',
				questionnaire: {},
				showPage: 1,
				disabledBtn: true,
				chat: {
					id: 0,
					message: ''
				},
				messageList: [{
					user: 'gpt',
					message: "你好，我是GPT，请问有什么可以帮到您？",
					// time: moment()
				}],
				answer: '',
				scoreRule: [{
					required: true,
					message: '请选择评分',
					trigger: 'blur'
				}, {
					validator: validatePass,
					trigger: ['blur', 'change']
				}],
				iconClasses: ['icon-rate-face-1', 'icon-rate-face-2', 'icon-rate-face-3']
			};
		},
		onLoad() {
			this.getExperiment()
		},
		methods: {
			submitForm() {
				this.$refs.formName.validate((valid) => {
					if (valid) {
						let data = {
							id: this.questionnaire.id,
							answers: []
						}
						data.answers = this.questionnaire.questions.map((item) => {
							return {
								id: item.id,
								answer: item.answer,
								text: item.text,
								scores: item.scores
							}
						})
						console.log(data)
						answerQuestionApi(data).then(res => {
							this.$message.success('提交成功')
							setTimeout(() => {
								uni.redirectTo({
									url: '/pages/answer/answer'
								})
							}, 300)
						})
					} else {
						this.$message.warning('请填写或者选择必选题目')
						return false;
					}
				});
			},
			chatPost(id, message) {
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
			getExperiment() {
				experimentApi().then(res => {
					let questionnaire = res.experiment.questionnaire
					questionnaire.questions = questionnaire.questions.map(item => {
						let scores = []
						if (item.type == 4) {
							item.choice.map(choice => {
								scores.push(0)
							})
							if (item.score_text && item.score_text.length) {
								let text = item.score_text
								if (item.score_type == 1) {
									let scoreText = ['1', '不同意', '一般', '同意', '5']
									if (scoreText.length == text.length) {
										item.score_text = text
									} else {
										scoreText[0] = text[0]
										scoreText[scoreText.length - 1] = text.length > 1 ? text[text
											.length - 1] : '5'
										item.score_text = scoreText
									}
								}
								if (item.score_type == 2) {
									let scoreText = ['1', '不同意', '比较不同意', '一般', '比较同意', '同意', '7']
									if (scoreText.length == text.length) {
										item.score_text = text
									} else {
										scoreText[0] = text[0]
										scoreText[scoreText.length - 1] = text.length > 1 ? text[text
											.length - 1] : '7'
										item.score_text = scoreText
									}
								}
								if (item.score_type == 3) {
									let scoreText = ['1', '不同意', '同意', '4']
									if (scoreText.length == text.length) {
										item.score_text = text
									} else {
										scoreText[0] = text[0]
										scoreText[scoreText.length - 1] = text.length > 1 ? text[text
											.length - 1] : '4'
										item.score_text = scoreText
									}
								}
							}
						}
						return {
							...item,
							"answer": [],
							"text": "",
							"scores": scores
						}
					})
					this.questionnaire = questionnaire
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.remark {
		font-size: 12px;
		color: #555555;
		line-height: 1.5;
		text-indent: 2em;

		.text {
			transform: scale(0.83);
			// transform-origin: 0 0;
		}

		.first-text {
			color: #f56c6c;
		}
	}

	.title {
		text-align: center;
		line-height: 60px;
		background-color: #ffffff;
	}

	.page-content {
		height: calc(100vh - 220px);
	}

	.questions-title {
		margin-bottom: 10px;
	}

	.center-view {
		max-width: 980px;
		margin: 0 auto;
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

	.flex-c {
		display: flex;
		align-items: center;
		height: 40px;
	}

	// .flex-between {
	// 	width: 150px;
	// 	display: flex;
	// 	align-items: center;
	// 	justify-content: space-between;
	// 	line-height: 20px;
	// }

	// .text-infomation {
	// 	font-size: 10px;
	// 	color: var(--UI-BG-4);
	// }
</style>