### liu-slide-questions适用于uni-app项目的 滑动切换答题模版
### 本组件目前兼容微信小程序、H5
### 本组件支持小程序和H5 简单好用易修改、支持单选多选简答等各类题型、支持各类样式自定义
### 如使用过程中有问题或有一些好的建议，欢迎qq联系：2364518038

``` html
<liu-slide-questions :questionsAnswer="questionsAnswer" @submit="subData"></liu-slide-questions>
```

``` javascript
export default {
	data() {
		return {
			//问题列表数据
			questionsAnswer: [{
				title: '这是一道单选题',
				problemType: 'SINGLE',
				children: [{
					ifselect: 0,
					alias: 'A',
					answer: '选项1'
				},{
					ifselect: 0,
					alias: 'B',
					answer: '选项2'
				},{
					ifselect: 0,
					alias: 'C',
					answer: '选项3'
				}],
			},{
				title: '这是一道多选题',
				problemType: 'MULTY',
				children: [{
					ifselect: 0,
					alias: 'A',
					answer: '选项1'
				},{
					ifselect: 0,
					alias: 'B',
					answer: '选项2'
				},{
					ifselect: 0,
					alias: 'C',
					answer: '选项3'
				},{
					ifselect: 0,
					alias: 'D',
					answer: '选项4'
				}],
			},{
				title: '这是一道简答题',
				problemType: 'QUESTION',
				answer: ''
			}],
		};
	},
	methods: {
		//点击提交
		subData(data){
			console.log('提交的数据',JSON.parse(JSON.stringify(data)))
		}
	}
}
```

### 属性说明
| 名称                         | 类型            | 默认值               			| 描述            |
| ----------------------------|--------------- | --------------------     | ---------------|
| questionsAnswer             | Array          | []             			    | 问题列表数据