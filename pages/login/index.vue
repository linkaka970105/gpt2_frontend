<template>
	<div class="page-login">
		<div class="box">
			<p class="desc"><rich-text :nodes="title"></rich-text></p>
			<el-form ref="form" class="form" size="medium" :disabled="saving">
				<el-form-item label="用户名">
					<el-input placeholder="请输入Email" v-model="form.username" maxlength="50"
						auto-complete="off"></el-input>
				</el-form-item>

				<el-form-item label="密码">
					<el-input :type="passw" placeholder="请输入密码" v-model="form.password" maxlength="50"
						auto-complete="off">
						<i slot="suffix" :class="icon" @click="showPass"></i>
					</el-input>
				</el-form-item>
			</el-form>
			<el-button round size="mini" class="submit-btn" @click="login" :loading="saving">登录</el-button>
		</div>
	</div>
</template>

<script>
	import {
		loginApi
	} from '@/api/api.js'
	export default {
		data() {
			return {
				title: '',
				bottom: '',
				form: {
					username: "",
					password: "",

				},
				saving: false,
				icon: "el-input__icon el-icon-view",
				passw: "password",

			};
		},
		onLoad() {
			this.getinfo()
		},
		methods: {
			getinfo() {
				uni.request({
					url: 'http://119.91.192.119:8089/api/basic_info',
					method: 'GET',
					success: (res) => {
						console.log(res.data.login_title);
						this.title = res.data.login_title
						this.bottom = res.data.index_bottom_tips
					}
				})
			},
			showPass() {
				//点击图标是密码隐藏或显示
				if (this.passw == "text") {
					this.passw = "password";
					//更换图标
					this.icon = "el-input__icon el-icon-view";
				} else {
					this.passw = "text";
					this.icon = "el-input__icon el-icon-loading";
				};
			},
			login() {
				const {
					username,
					password
				} = this.form;
				const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
				if (!emailRegex.test(username)) {
					return this.$message.warning("邮箱格式不正确");
				}
				if (!username) {
					return this.$message.warning("用户名不能为空");
				}

				if (!password) {
					return this.$message.warning("密码不能为空");
				}
				this.saving = true
				loginApi({
					email: username,
					password: password
				}).then(res => {
					console.log(res)
					uni.setStorageSync("token", res.info.token)
					this.$message.success('登录成功')
					setTimeout(() => {
						uni.navigateTo({
							url: '/pages/test/test'
						})
					}, 300)
				}).finally(() => {
					this.saving = false
				})
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-login {
		height: 100vh;
		width: 100vw;
		position: relative;
		background-color: $uni-color-main;

		.box {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			height: 500px;
			width: 500px;
			position: absolute;
			left: calc(50% - 250px);
			top: calc(50% - 250px);

			.logo {
				height: 50px;
				margin-bottom: 20px;
			}

			.desc {
				color: #ccc;
				font-size: 14px;
				line-height: 24px;
				margin-bottom: 60px;
				letter-spacing: 1px;
				text-align: center;
			}

			/deep/.el-form {
				width: 300px;
				border-radius: 3px;

				.el-form-item {
					margin-bottom: 20px;

					&__label {
						color: #ccc;
					}
				}

				.el-input {
					.el-input__inner {
						border: 0;
						border-bottom: 0.5px solid #999;
						border-radius: 0;
						padding: 0;
						background-color: transparent;
						color: #ccc;
						transition: border-color 0.3s;
						position: relative;

						&:focus {
							border-color: #fff;
							color: #fff;
						}

						&:-webkit-autofill {
							-webkit-text-fill-color: #fff !important;
							-webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
							transition: background-color 50000s ease-in-out 0s;
						}
					}
				}

				.captcha {
					position: relative;

					.value {
						position: absolute;
						bottom: 1px;
						right: 0;
					}
				}
			}

			.submit-btn {
				margin-top: 40px;
				border-radius: 30px;
				padding: 10px 40px;
				color: #000;
			}
		}
	}
</style>