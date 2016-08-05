/*
 * @Author: fanzhang
 * @Date:   2016-08-04 13:59:59
 * @Last Modified by:   fanzhang
 * @Last Modified time: 2016-08-05 15:23:07
 */

'use strict';
window.Slider = (function() {

	var MIN_AGE = 0;       //最小的年龄
	var MAX_AGE = 120;    //最大的年龄
	var AGE_DURATION = 5; //间隔5年 中间插入一个大一点的刻度
	var START_AGE = 30;//初始的年龄
	var YEAR_DIS = 18; //1年间隔18个像素。调整css会修改。
	var WIDTH = 300; //container的宽度
	var CONTAINER_ID = "ageMainContainer";
	
	var HTML = [
		'<p class="sub-title age-title" id="{ageId}">{age}</p>',
		'<div class="age-container" id="{sliderContainerId}">',
		'		<div id="{bgContainerId}" style="left:0px;" class="bg-container">{htmlContent}</div>',
		'		<div id="{needleId}" class="needle"  style="left:{offset}px;" ><a></a></div>',
		'</div>'
	].join('');

	function tpl_replace(tpl, obj) {
		if (obj == null) return '';
		var result = '';
		result = tpl.replace(/\{([\w]+)\}/gi, function(word, key) {
			if (obj[key] != undefined) {
				return obj[key];
			}
		})
		return result;
	}

	function Slider(config) {
		var config = config || {};
		this.minAge = config.minAge || MIN_AGE;
		this.maxAge = config.maxAge || MAX_AGE;
		this.ageDuration = config.ageDuration || AGE_DURATION; 
		this.startAge = config.startAge || START_AGE;
		this.yearDis = config.yearDis || YEAR_DIS;
		this.containerId = config.containerId || CONTAINER_ID;

		this.offset = WIDTH/2;//指针的偏移，默认在左边
		this.age = this.startAge;//当前的年龄
		this.maxLeft = 0;//最左边只能到指针的1半
		this.minLeft = - this.yearDis * (this.maxAge - this.minAge); //指针能移动的最右边，为负值
		this.transFormX = -(this.startAge-this.minAge) * this.yearDis;//相对与最左边移动的位置
		this.idObj = {
			ageId: 'ageId',
			sliderContainerId: 'sliderContainerId',
			bgContainerId: 'bgContainerId',
			needleId: 'needleId'
		};
		this.init();

	}
	Slider.prototype = {
		init: function() {
			this.createDom();
			this.setPosition(this.transFormX);
			this.bindEvent();
		},
		setPosition: function(transFormDis) { //移动背景的位置
			var age = this.minAge-Math.round( (transFormDis / this.yearDis)) ;
			this.age = age;
			$("#" + this.containerId).find("#" + this.idObj.ageId).html(age);
			$("#" + this.containerId).find("#"+this.idObj.bgContainerId).css("transform",'translateX(' + (this.offset - (age-this.minAge) * this.yearDis) + 'px)');
		},
		createDom: function() {
			var html = [];
			for (var i = this.minAge ; i <= this.maxAge; i++) {
				if (i % this.ageDuration !== 0) {
					html.push('<a style="width:'+this.yearDis+'px"></a>');
				} else {
					html.push('<a class="high"  style="width:'+this.yearDis+'px"><span>' + i + '</span></a>'); //比较粗的指针
				}
			}
			var renderObj = $.extend(this.idObj, {
				htmlContent: html.join(""),
				age: this.age,
				offset: this.offset
			});
			$("#" + this.containerId).html(tpl_replace(HTML, renderObj));
		},
		bindEvent: function() {
			var _this = this;
			var startX;
			$("#" + this.containerId).on("touchstart mousedown", touchStart).bind("touchmove mousemove", touchMove).bind("touchend mouseup", touchEnd);
			function resetLeft(dis) {
				var ret = dis;
				ret = ret < _this.minLeft ? _this.minLeft : ret;
				ret = ret > _this.maxLeft ? _this.maxLeft : ret;
				return ret;
			}
			var dragging = false;

			function touchStart(event) {
				var event = event.originalEvent || window.event
				console.log("touch start....");
				event.preventDefault();
				startX = event.type.startsWith("touch") ? event.touches[0].clientX : event.clientX;
				dragging = true;
				
			}

			function touchMove(event) {
				var event = event.originalEvent || window.event
				if (dragging) {
				// console.log("touch move.......");
					event.preventDefault();
					var clientX  = event.type.startsWith("touch") ? event.touches[0].clientX : event.clientX;
					var eventDis = clientX - startX;
					_this.setPosition(resetLeft(_this.transFormX + eventDis * 0.8));
				}
			}

			function touchEnd(event) {
				var event = event.originalEvent || window.event
				// console.log("touch end....");
				event.preventDefault();
				var clientX  = event.type.startsWith("touch") ? event.changedTouches[0].clientX : event.clientX;
				var eventDis = clientX - startX;
				_this.transFormX = resetLeft(_this.transFormX + eventDis * 0.8);
				dragging = false;
			}
	
		}
	}
	return Slider;
})();