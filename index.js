'use strict'

/**
 * static files (404.html, sw.js, conf.js)
 */
//const ASSET_URL = 'https://pas.rrtesp.eu.org/'
const PREFIX = '/'
const Config = {
    jsdelivr: 0
}

// 植入 _worker.js 的样式和页面模板
const mainPage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet">
  <title>GitHub Accelerator</title>
  <link rel="Icon" href="https://github.githubassets.com/favicons/favicon.png" type="image/x-icon" />
  <style>
    /* 使用 _worker.js 的样式 */
    .background-layer {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      background: 
        linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3)),
        url('https://cdn.jsdelivr.net/gh/ITJoker233/BingPicApi/pic/20250327.png') center/cover;
      filter: saturate(0.8) brightness(0.95);
      animation: backgroundPan 30s linear infinite;
    }

    @keyframes backgroundPan {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .main-container {
      position: relative;
      padding-top: 2rem;
    }

    .proxy-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(5px);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }

    .input-field input[type="text"]:focus {
      border-bottom: 2px solid #2196F3 !important;
      box-shadow: 0 1px 0 0 #2196F3 !important;
    }

    /* 新增 GitHub 加速专用样式 */
    .github-stats {
      padding: 1rem;
      background: rgba(245, 245, 245, 0.9);
      border-radius: 8px;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="background-layer"></div>

  <div class="main-container">
    <div class="row">
      <div class="col s12 m8 offset-m2 l6 offset-l3">
        <div class="card proxy-card">
          <div class="card-content">
            <span class="card-title center-align blue-text">
              <i class="material-icons">⚡</i>
              GitHub 加速服务
            </span>

            <div class="github-stats">
              <h6>当前服务状态</h6>
              <ul class="browser-default">
                <li>CDN 提供商：<a href='https://cloudflare.com' target="_blank">Cloudflare</a>,
                <a href='https://www.jsdelivr.com/' target="_blank">JsDelivr</a></li>
                <li>源项目：<a href='https://github.com/hunshcn/gh-proxy/' target="_blank">gh-proxy</a></li>
              </ul>
            </div>

            <form id="githubForm">
              <div class="input-field">
                <input type="text" id="repoUrl" 
                      placeholder="https://github.com/user/repo/blob/main/file.js">
                <label for="repoUrl">GitHub 资源地址</label>
              </div>
              <button class="btn waves-effect waves-light blue darken-2" type="submit">
                获取加速链接
              </button>
            </form>
          </div>
        </div>

        <div class="card proxy-card">
          <div class="card-content" >
            <ol class="browser-default">
              <span id="jinrishici-sentence">正在加载今日诗词....</span>
              <script src="https://sdk.jinrishici.com/v2/browser/jinrishici.js" charset="utf-8"></script>
            </ol>
          </div>
        </div>

        <div class="card proxy-card">
          <div class="card-content">
            <h6 class="blue-text"><i class="material-icons">##</i> 使用指南</h6>
            <ol class="browser-default">
              <li>GitHub文件链接带不带协议头都可以，支持release、archive以及文件，右键复制出来的链接都是符合标准的，更多用法、clone加速请参考<a href='https://hunsh.net/archives/23/' target="_blank">这篇文章</a>。</li>
              <li>release、archive使用cf加速，文件会跳转至JsDelivr</li>
              <li>注意，不支持项目文件夹</li>
            </ol>
          </div>
        </div>

        <div class="card proxy-card">
          <div class="card-content">
            <h6 class="blue-text"><i class="material-icons">##</i> 输入示例</h6>
            <ol class="browser-default">
              <li>分支源码：https://github.com/hunshcn/project/archive/master.zip</li>
              <li>release源码：https://github.com/hunshcn/project/archive/v0.1.0.tar.gz</li>
              <li>release文件：https://github.com/hunshcn/project/releases/download/v0.1.0/example.zip</li>
              <li>分支文件：https://github.com/hunshcn/project/blob/master/filename</li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      M.AutoInit();

      // 表单处理
      document.getElementById('githubForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const input = document.getElementById('repoUrl').value.trim();
        const proxyUrl = new URL(window.location.href);
        proxyUrl.searchParams.set('q', input);
        window.open(proxyUrl.toString(), '_blank');
      });
    });
  </script>
</body>
</html>
`;

const whiteList = [];
const PREFLIGHT_INIT = {
    status: 204,
    headers: new Headers({
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
        'access-control-max-age': '1728000',
    }),
};

// 原有正则表达式保持不变
const exp1 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:releases|archive)\/.*$/i;
const exp2 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:blob|raw)\/.*$/i;
const exp3 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:info|git-).*$/i;
const exp4 = /^(?:https?:\/\/)?raw\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+?\/.+$/i;
const exp5 = /^(?:https?:\/\/)?gist\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+$/i;
const exp6 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/tags.*$/i;

function makeRes(body, status = 200, headers = {}) {
    headers['access-control-allow-origin'] = '*';
    return new Response(body, {status, headers});
}

function newUrl(urlStr) {
    try {
        return new URL(urlStr);
    } catch (err) {
        return null;
    }
}

addEventListener('fetch', e => {
    const ret = fetchHandler(e).catch(err => makeRes('cfworker error:\n' + err.stack, 502));
    e.respondWith(ret);
});

function checkUrl(u) {
    return [exp1, exp2, exp3, exp4, exp5, exp6].some(re => re.test(u));
}

async function fetchHandler(e) {
    const req = e.request;
    const urlStr = req.url;
    const urlObj = new URL(urlStr);
    
    // 返回美化后的主页
    if (urlObj.pathname === PREFIX && !urlObj.search) {
        return new Response(mainPage, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=3600'
            }
        });
    }

    // 原有处理逻辑保持不变
    let path = urlObj.searchParams.get('q');
    if (path) {
        return Response.redirect('https://' + urlObj.host + PREFIX + path, 301);
    }

    path = urlObj.href.substr(urlObj.origin.length + PREFIX.length).replace(/^https?:\/+/, 'https://');
    
    if (path.match(exp1) || path.match(exp5) || path.match(exp6) || path.match(exp3) || path.match(exp4)) {
        return httpHandler(req, path);
    } else if (path.match(exp2)) {
        if (Config.jsdelivr) {
            const newUrl = path.replace('/blob/', '@').replace(/^(?:https?:\/\/)?github\.com/, 'https://cdn.jsdelivr.net/gh');
            return Response.redirect(newUrl, 302);
        } else {
            path = path.replace('/blob/', '/raw/');
            return httpHandler(req, path);
        }
    } else if (path.match(exp4)) {
        const newUrl = path.replace(/(?<=com\/.+?\/.+?)\/(.+?\/)/, '@$1').replace(/^(?:https?:\/\/)?raw\.(?:githubusercontent|github)\.com/, 'https://cdn.jsdelivr.net/gh');
        return Response.redirect(newUrl, 302);
    } //else {
    //     return fetch(ASSET_URL + path);
    // }
}

// 保持原有 httpHandler 和 proxy 函数不变
function httpHandler(req, pathname) {
    const reqHdrRaw = req.headers

    // preflight
    if (req.method === 'OPTIONS' &&
        reqHdrRaw.has('access-control-request-headers')
    ) {
        return new Response(null, PREFLIGHT_INIT)
    }

    const reqHdrNew = new Headers(reqHdrRaw)

    let urlStr = pathname
    let flag = !Boolean(whiteList.length)
    for (let i of whiteList) {
        if (urlStr.includes(i)) {
            flag = true
            break
        }
    }
    if (!flag) {
        return new Response("blocked", {status: 403})
    }
    if (urlStr.search(/^https?:\/\//) !== 0) {
        urlStr = 'https://' + urlStr
    }
    const urlObj = newUrl(urlStr)

    /** @type {RequestInit} */
    const reqInit = {
        method: req.method,
        headers: reqHdrNew,
        redirect: 'manual',
        body: req.body
    }
    return proxy(urlObj, reqInit)
}


/**
 *
 * @param {URL} urlObj
 * @param {RequestInit} reqInit
 */

async function proxy(urlObj, reqInit) {
  const res = await fetch(urlObj.href, reqInit)
    const resHdrOld = res.headers
    const resHdrNew = new Headers(resHdrOld)

    const status = res.status

    if (resHdrNew.has('location')) {
        let _location = resHdrNew.get('location')
        if (checkUrl(_location))
            resHdrNew.set('location', PREFIX + _location)
        else {
            reqInit.redirect = 'follow'
            return proxy(newUrl(_location), reqInit)
        }
    }
    resHdrNew.set('access-control-expose-headers', '*')
    resHdrNew.set('access-control-allow-origin', '*')

    resHdrNew.delete('content-security-policy')
    resHdrNew.delete('content-security-policy-report-only')
    resHdrNew.delete('clear-site-data')

    return new Response(res.body, {
        status,
        headers: resHdrNew,
    })
}
