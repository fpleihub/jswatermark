/**
 * Created by fplei on 2020/8/30.
 */
(function (window) {
    function jQuery (selector) {

        return new jQuery.fn.init(selector)
    }
    jQuery.fn = jQuery.prototype = {
        constructor: jQuery,
        init: function(selector) {
            let elements = document.querySelectorAll(selector);
            for (let i = 0; i<elements.length; i++){
                this[i] = elements[i]
            }
            this.length = elements.length
        }
    };
    jQuery.fn.init.prototype = jQuery.fn;
    jQuery.fn.extend = jQuery.extend = function (...args) {
        let target = [], source = [...args];
        if (args.length === 1) {
            target = this
        } else {
            target = args[0];
            source.splice(0,1)
        }
        Object.assign(target, ...source);
        return target
    };
    //位置
    jQuery.fn.MarkPoint=jQuery.MarkPoint={
        Left_Top:0,//左上角
        Right_Top:1,//右上角
        Left_Bottom:2,//左下角
        Right_Bottom:3,//右下脚
        Center:4,//居中
        Fill:5//满屏-文字水印模式下生效
    };
    //方向
    jQuery.fn.MarkDirect=jQuery.MarkDirect={
        Horizontal:0,//水平
        Left_Rote:1,//左倾斜
        Right_Rote:2//右倾斜
    };
    jQuery.fn.ImageSize=jQuery.ImageSize={
        AutoImage:0,//根据图片大小显示
        AutoCanvas:1,//根据画布设置大小
        AutoParent:2,//根据父级元素大小
        FillScreen:3,//宽充满屏幕
        AutoSmartRate:4//自动根据图片与屏幕宽高比率设置
    };
    jQuery.extend({
        screenInfo(){
            return {width:document.body.clientWidth,height:document.body.clientHeight};
        },
        markImage(ctx,imageMarkOptions,parentWidth,parentHeight){
            console.log(imageMarkOptions);
            var imgMark=new Image();
            imgMark.src=imageMarkOptions.attachImageUrl;
            imgMark.onload=function () {
                ctx.globalAlpha =imageMarkOptions.alpha;
                var x,y=0;
                if(imageMarkOptions.point==$.MarkPoint.Left_Top){
                    x=5;y=5;
                }else if(imageMarkOptions.point==$.MarkPoint.Left_Bottom){
                    x=5;y=parentHeight-imageMarkOptions.height-5;
                }else if(imageMarkOptions.point==$.MarkPoint.Right_Top){
                    x=parentWidth-imageMarkOptions.width-5;y=5;
                }else if(imageMarkOptions.point==$.MarkPoint.Center){
                    x=(parentWidth/2)-(imageMarkOptions.width/2);y=(parentHeight/2)-(imageMarkOptions.height/2);
                }else{
                    //to default right bottom
                    x=parentWidth-imageMarkOptions.width-5;y=parentHeight-imageMarkOptions.height-5;
                }
                var markNum=1;
                var availHeight=window.screen.height;
                if(imageMarkOptions.pageNum<=0){
                   //根据图片高度与屏幕高度自动计算需要打几次图片水印
                    if(parentHeight>window.screen.availHeight){
                        markNum= Math.floor(parentHeight/availHeight)
                    }
                }else {
                    markNum=imageMarkOptions.pageNum;
                }
                if(markNum>1){
                    for(var i=0;i<markNum;i++){
                        var ty=availHeight*(i+1);
                        ctx.drawImage(imgMark,x,ty,imageMarkOptions.width,imageMarkOptions.height);
                    }
                }
                ctx.drawImage(imgMark,x,y,imageMarkOptions.width,imageMarkOptions.height);
            };
        },
        markText(ctx,textMarKOptions,fontSize,parentWidth,parentHeight){
            var widths=parentWidth;
            var heights=parentHeight;
            var rowNum = heights / 20;
            var colNum = (heights / widths) * textMarKOptions.textDensity;
            var colSpaceNum = 130;
            var rowSpaceNum = 100;
            var siglnX,siglnY=0;
            var textPix=textMarKOptions.attachText.length*fontSize;
            if(textMarKOptions.point==$.MarkPoint.Left_Top){
                rowNum=1;siglnX=5;siglnY=textPix/5;
            }else if(textMarKOptions.point==$.MarkPoint.Left_Bottom){
                rowNum=1;siglnX=5;siglnY=heights-10;
            }else if(textMarKOptions.point==$.MarkPoint.Right_Top){
                rowNum=1;siglnX=widths-(textPix/1.2);siglnY=textPix/5;
            }else if(textMarKOptions.point==$.MarkPoint.Right_Bottom){
                rowNum=1;siglnX=widths-(textPix/1.2);siglnY=heights-10;
            }else if(textMarKOptions.point==$.MarkPoint.Center){
                rowNum=1;siglnX=(widths/2)-(textPix/2);siglnY=heights/2;
            }else {
                heights / 20;
            }
            for (var i = 0; i < rowNum; i++) {
                if(textMarKOptions.direct==$.MarkDirect.Left_Rote){
                    ctx.rotate((-45 * Math.PI) / 180);
                }else if(textMarKOptions.direct==$.MarkDirect.Right_Rote){
                    ctx.rotate((45 * Math.PI) / 180);
                }
                if(rowNum<=1){
                    ctx.fillText(textMarKOptions.attachText,siglnX,siglnY);
                }else {
                    for (var j = 0; j < colNum; j++) {
                        var x = colSpaceNum;
                        if (widths > heights) {
                            x = Math.floor(Math.random() * (-heights - widths)) + widths;
                        } else {
                            x = Math.floor(Math.random() * (-heights - heights)) + heights;
                        }
                        ctx.fillText(textMarKOptions.attachText, x+(i*j), i * rowSpaceNum);
                    }
                }
                if(textMarKOptions.direct==$.MarkDirect.Left_Rote){
                    ctx.rotate((45 * Math.PI) / 180);
                }else if(textMarKOptions.direct==$.MarkDirect.Right_Rote){
                    ctx.rotate((-45 * Math.PI) / 180);
                }
            }
        },
        textMarKOptions(text,point,direct,rgbaStyle,textDensity){
            if(point==null){
                point=$.MarkPoint.Center;
            }
            if(!direct){
                direct=$.MarkDirect.Horizontal;
            }
            if(!rgbaStyle){
                rgbaStyle="rgba(255,255,255,0.5)";
            }
            if(!textDensity){
                textDensity=1;
            }
            return {attachText:text,point:point,direct:direct,rgbaStyle:rgbaStyle,textDensity:textDensity}
        },
        imageMarkOptions(imageUrl,width,height,point,direct,alpha,imageDensity,pageNum){
            if(!point){
                point=$.MarkPoint.Right_Bottom;
            }
            if(!direct){
                direct=$.MarkDirect.Horizontal;
            }
            if(!alpha){
                alpha=0.5
            }
            if(!imageDensity){
                imageDensity=1;
            }
            if(!width||!height){
                width=100;height=100;
            }
            if(!pageNum){
                pageNum=0;
            }
            return {attachImageUrl:imageUrl,width:width,height:height,point:point,direct:direct,alpha:alpha,imageDensity:imageDensity,pageNum:pageNum}
        },

        /**
         * 生成水印
         * @param canvasId   画布编号
         * @param imageUrl   显示底图url
         * @param imageSizeMode 尺寸样式
         * @param imageMarkOptions 图标水印样式
         * @param textMarKOptions 文字水印样式
         */
        takeWatermark(canvasId,imageUrl,imageSizeMode,imageMarkOptions,textMarKOptions){
            var img = new Image();
            img.src = imageUrl;
            if(!imageSizeMode){
                imageSizeMode=$.ImageSize.AutoImage;
            }
            img.onload = function () {
                var canvas = $(canvasId)[0];
                var widths = img.width;
                var heights = img.height;
                if(imageSizeMode==$.ImageSize.AutoCanvas){
                    widths=canvas.width>0?canvas.width:widths;
                    heights=canvas.height>0?canvas.height:heights;
                }else if(imageSizeMode==$.ImageSize.AutoParent){
                    var parentNode=canvas.parentNode;
                    widths=parentNode.offsetWidth;
                    heights=parentNode.offsetHeight;
                }else if(imageSizeMode==$.ImageSize.FillScreen){
                    var screen=$.screenInfo();
                    widths=screen.width;
                    if(heights<screen.height){
                        heights=screen.height;
                    }
                }else if(imageSizeMode==$.ImageSize.AutoSmartRate){
                    var screen=$.screenInfo();
                    widths=(widths>screen.width)?screen.width:(widths/screen.width)*widths;
                    heights=(heights>screen.height)?screen.height:(screen.height/heights)*heights;
                }
                canvas.width = widths;
                canvas.height = heights;
                var coefficient = widths / 30;
                var fontSize = 30 + coefficient;
                var ctx = canvas.getContext("2d");
                if(!ctx){
                    canvas.parentNode.appendChild(img);
                    return
                }
                ctx.drawImage(img, 0, 0, widths, heights);
                ctx.save();
                if(imageMarkOptions&&imageMarkOptions.attachImageUrl){
                    $.markImage(ctx,imageMarkOptions,widths,heights)
                }
                ctx.restore();
                ctx.save();
                if(textMarKOptions){
                    ctx.font = fontSize + "px Arial";
                    ctx.fillStyle = textMarKOptions.rgbaStyle;
                    $.markText(ctx,textMarKOptions,fontSize,widths,heights)
                }
                ctx.restore()
            }
        }
    });
    // 添加DOM类方法
    jQuery.fn.extend({
        css (name,value) {
            for (let i = 0; i < this.length; i++) {
                this[i].style[name] = value
            }
        },
        attr () {
            console.log('attr方法')
        },

    });
    window.$ = window.jQuery = jQuery
})(window);