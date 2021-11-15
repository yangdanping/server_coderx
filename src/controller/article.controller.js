const fs = require('fs'); //fs模块用于读取文件信息,如获取到用户头像信息后找到图像资源返回给前端
const articleService = require('../service/article.service.js');
const fileService = require('../service/file.service.js');
const { PICTURE_PATH } = require('../constants/file-path');

class ArticleController {
  async addArticle(ctx, next) {
    // 1.获取用户id(从验证token的结果中拿到)文章数据
    const userId = ctx.user.id;
    const { title, content } = ctx.request.body;
    // 2.根据传递过来参数在数据库中插入文章
    const result = await articleService.addArticle(userId, title, content);
    // 3.将插入数据库的结果处理,给用户(前端/客户端)返回真正的数据
    if (result) {
      console.log('发布文章成功!');
      ctx.body = { statusCode: 1, data: result };
    } else {
      console.log('发布文章失败!');
      ctx.body = { statusCode: 0, data: result };
    }
  }
  async likeArticle(ctx, next) {
    // 1.获取用户id和点赞的文章id
    const { articleId } = ctx.params;
    const userId = ctx.user.id;
    // 2.根据传递过来参数在数据库中判断是否有点赞,有则取消点赞,没有则成功点赞
    const haslike = await articleService.haslike(articleId, userId);
    if (!haslike) {
      const result = await articleService.addlike(articleId, userId);
      ctx.body = { statusCode: 1, data: result }; //增加一条点赞记录
    } else {
      const result = await articleService.removelike(articleId, userId);
      ctx.body = { statusCode: 0, data: result }; //删除一条点赞记录
    }
  }
  async getDetail(ctx, next) {
    // 1.获取文章id
    const { articleId } = ctx.params;
    console.log(articleId);
    // 2.根据传递过来文章id在数据库中查询单个文章
    const result = await articleService.getArticleById(articleId);
    // 3.将查询数据库的结果处理,给用户(前端/客户端)返回真正的数据
    if (result) {
      console.log('查询单个文章成功!');
      ctx.body = { statusCode: 1, data: result };
    } else {
      console.log('发布单个文章失败!');
      ctx.body = { statusCode: 0, data: result };
    }
  }
  async getList(ctx, next) {
    // 1.获取文章列表的偏离量和数据长度
    const { offset, size } = ctx.query;
    // 2.根据传递过来偏离量和数据长度在数据库中查询文章列表
    const result = await articleService.getArticleList(offset, size);
    result.forEach((article) => (article.content = article.content.replace(new RegExp('<(S*?)[^>]*>.*?|<.*? />|&nbsp; ', 'g'), '')));
    const { total } = await articleService.getTotal();
    // 3.将查询数据库的结果处理,给用户(前端/客户端)返回真正的数据
    if (result) {
      console.log('查询文章列表成功!');
      ctx.body = { statusCode: 1, data: result, total };
    } else {
      console.log('发布文章列表失败!');
      ctx.body = { statusCode: 0, data: result };
    }
  }
  async update(ctx, next) {
    // 1.获取用户修改的文章内容或者标题
    const { title, content } = ctx.request.body;
    const { articleId } = ctx.params; //articleId来自路径
    // 2.根据传递过来文章标题和内容,在数据库中做修改
    const result = await articleService.update(title, content, articleId);
    // 3.将修改数据库的结果处理,给用户(前端/客户端)返回真正的数据
    if (result) {
      console.log('修改文章成功!');
      ctx.body = { statusCode: 1, data: result };
    } else {
      console.log('修改文章失败!');
      ctx.body = { statusCode: 0, data: result };
    }
  }
  async delete(ctx, next) {
    // 1.删除文章只需获取id
    const { articleId } = ctx.params;
    // 2.根据传递过来文章id直接在数据库删除对应id的文章
    const result = await articleService.delete(articleId);
    // 3.将修改数据库的结果处理,给用户(前端/客户端)返回真正的数据
    if (result) {
      console.log('删除文章成功!');
      ctx.body = { statusCode: 1, data: result };
    } else {
      console.log('删除文章失败!');
      ctx.body = { statusCode: 0, data: result };
    }
  }
  async addTag(ctx, next) {
    // 1.获取数据(获取我们之前verifytagExists整合好的tags数组和文章id)
    // const { tags } = ctx.request.body;
    const { tags } = ctx; //拿到了用户所选择的标签
    const { articleId } = ctx.params; //拿到了被添加标签的文章
    // 2.添加所有的标签(害得做判断,若该文章已经有个标签叫JS了,则不需要再添加了)
    for (const tag of tags) {
      // 2.1判断标签是否已和文章有过关系了(若关系表中不存在,则添加关系)
      const isExist = await articleService.hasTag(articleId, tag.id);
      console.log(`该标签与文章在关系表中${!isExist ? '不存在,可添加' : '存在'}`);
      if (!isExist) {
        await articleService.addTag(articleId, tag.id);
      }
    }
    // 3.不需要返回数据其实,总结:多对多的核心是这张关系表
    // ctx.body = '为该文章添加标签成功!';
  }
  async getFileInfo(ctx, next) {
    // 1.获取数据(一条动态的每张图片来说,是用filename来区分不同的图的,所以路径中要拼接filename,到这里来获取)
    // 注意!要对前端传来的图片的尺寸参数判断,没有则请求的是原图,有则拼接上对应尺寸
    let { filename } = ctx.params; //改成let以便在下面进行type的拼接
    const { type } = ctx.query;
    const fileInfo = await fileService.getFileByFilename(filename);
    ['large', 'middle', 'small'].some((item) => item === type) ? (filename += '-' + type) : null; //调用数组的some函数,可判断数组中某个东西是等于某个值,返回布尔值
    // 2.根据获取到的id去数据库直接查询
    if (fileInfo) {
      console.log('获取动态图像信息成功', fileInfo);
      // 3.把查询到的图片做和用户获取头像一样也做特殊处理,就能返回
      ctx.response.set('content-type', fileInfo.mimetype);
      ctx.body = fs.createReadStream(`${PICTURE_PATH}/${filename}`); //拼接上我们对应图片的路径
    } else {
      console.log('获取用户头像信息失败');
    }
  }
}

module.exports = new ArticleController();