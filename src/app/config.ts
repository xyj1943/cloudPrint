/**
 * 不同环境下的对应配置项
 * @author AndyPan
 * @createdate 2019年3月5日15:33:50
 * @version 1.0.2
 * @remark 针对不同环境的相关配置项：api接口、文件上传相关、文件上传认证等信息
 */


// 当前环境（develop | test | production）
let environment = 'develop';
// 环境配置
let configs = {
    // 开发环境
    develop: {
        // 数据接口Host
        // apiHost: 'http://172.16.4.168:8031',
        apiHost: 'http://car.typeo.devp',
        // apiHost: 'http://localhost:7013',
        // 文件系统接口Host
        fileHost: 'http://file.car.typeo.devp/file',
        // 文件系统唯一标识认证Url
        identityUrl: 'http://www.spiderbim.devp',
        // 文件系统认证账号信息
        fetchtokenAccount: {
            // 账号
            myText: 'electrocar',
            // 密码(由：CryptoJS.MD5('asdfasdf').toString().toUpperCase()转换而来)
            myCode: '6A204BD89F3C8348AFD5C77C717A097A',
            // scope
            myScope: 'openid electrocar FileServer offline_access profile',
            // clientId
            myClientId: 'electrocar',
            // dummyClientSecret
            mySecret: 'electrocar'
        }
    },
    // 测试
    test: {
        // 数据接口Host
        apiHost: 'http://car.typeo.zzj',
        // apiHost: 'http://172.16.4.7:7001',
        // 文件系统接口Host
        fileHost: 'http://file.car.typeo.zzj/file',
        // 文件系统唯一标识认证Url
        identityUrl: 'http://www.spiderbim.devp',
        // 文件系统认证账号信息
        fetchtokenAccount: {
            // 账号
            myText: 'electrocar',
            // 密码(由：CryptoJS.MD5('asdfasdf').toString().toUpperCase()转换而来)
            myCode: '6A204BD89F3C8348AFD5C77C717A097A',
            // scope
            myScope: 'openid electrocar FileServer offline_access profile',
            // clientId
            myClientId: 'electrocar',
            // dummyClientSecret
            mySecret: 'electrocar'
        }
    },
    // 演示环境
    production: {
        // 数据接口Host
        apiHost: 'http://car.typeo.org',
        // 文件系统接口Host
        fileHost: 'http://file.car.typeo.org/file',
        // 文件系统唯一标识认证Url
        identityUrl: 'http://identity.typeo.org',
        // 文件系统认证账号信息
        fetchtokenAccount: {
            // 账号
            myText: 'electrocar',
            // 密码(由：CryptoJS.MD5('117c1aa7-c9bc-4c47-ad3f-653608fdcA15').toString().toUpperCase()转换而来)
            myCode: '8607888D2306E4D432F2070238A7555D',
            // scope
            myScope: 'openid profile FileServer',
            // clientId
            myClientId: 'car',
            // dummyClientSecret
            mySecret: 'secret'
        }
    }
    // 生产环境
    // production: {
    //     apiHost: 'http://au.typeo.org',
    //     fileHost: 'http://file.car.typeo.devp/file'
    // }
};
// 当前配置
let environmentConfigs = configs[environment];

// API接口host
export const APIHost = environmentConfigs.apiHost;
// 文件服务host
export const FileHost = environmentConfigs.fileHost;
// identityUrl
export const IdentityUrl = environmentConfigs.identityUrl;
// fetchtokenAccount
export const FetchtokenAccount = environmentConfigs.fetchtokenAccount;

// export const TenantId = 'a7273bce-23a1-450d-902d-7c30a4456635';

