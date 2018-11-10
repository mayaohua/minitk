// 云函数入口文件
const cloud = require('wx-server-sdk')

const hostName = 'http://39.104.98.23:3000/wx/tk/'

cloud.init()

const db = cloud.database()
const TcbRouter = require('tcb-router');

const request = require('request-promise');

// 云函数入口函数
exports.main = async (event, context) => {
    const app = new TcbRouter({ event });
    /**
     *   用户登录
     */
    app.router('login', async (ctx, next) => {
        ctx.body = request(hostName + 'login?code='+event.code).then(html =>
        {
            return html;
        }).catch(err => {
            console.log(err);
        })

    });

    /**
     *   保存用户信息
     */
    app.router('saveUserInfo', async (ctx, next) => {
        ctx.body =request({
            url: hostName+'user',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: event.body
        }).then(html => {
            return html;
        }).catch(err => {
            console.log(err);
        })
    });

    /**
     *   获取用户信息
     */
    app.router('sendUrl', async (ctx, next) => {
        console.log(event)
        ctx.body = request({
            url: hostName + event.url,
            method: event.method,
            json: true,
            headers: event.headers,
            body: event.body
        }).then(html => {
            return html;
        }).catch(err => {
            console.log(err);
        })

    });


    

    return app.serve();
}
