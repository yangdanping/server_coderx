const { connection, config } = require('../app');

class ArticleService {
  async addArticle(userId, title, content) {
    try {
      const statement = 'INSERT INTO article (user_id,title, content) VALUES (?,?,?);';
      const [result] = await connection.execute(statement, [userId, title, content]); //拿到的元数据是数组,解构取得查询数据库结果,也是个数组
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async haslike(articleId, userId) {
    try {
      const statement = `SELECT * FROM article_like WHERE article_id = ? AND user_id= ?;`;
      const [result] = await connection.execute(statement, [articleId, userId]);
      return result[0] ? true : false;
    } catch (error) {
      console.log(error);
    }
  }
  async addlike(articleId, userId) {
    try {
      const statement = `INSERT INTO article_like (article_id,user_id) VALUES (?,?);`;
      const [result] = await connection.execute(statement, [articleId, userId]);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
  async removelike(articleId, userId) {
    try {
      const statement = `DELETE FROM article_like WHERE article_id = ? AND user_id = ?;`;
      const [result] = await connection.execute(statement, [articleId, userId]);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
  async getArticleById(articleId) {
    try {
      // const statement = 'SELECT * FROM article WHERE id = ?;';
      const statement = `
      SELECT a.id id,a.title title,a.content content,a.createAt createAt,a.updateAt updateAt,
      JSON_OBJECT('id',u.id,'name',u.name,'avatarUrl',p.avatar_url) author,
      (SELECT COUNT(al.user_id) FROM article
      LEFT JOIN article_like al ON article.id = al.article_id
      WHERE article.id = a.id) likes,
      (SELECT COUNT(*) FROM comment c WHERE c.article_id = a.id) commentCount,
      IF(COUNT(tag.id),JSON_ARRAYAGG(JSON_OBJECT('id',tag.id,'name',tag.name)),NULL) tags,
      (SELECT JSON_ARRAYAGG(CONCAT('${config.APP_HOST}:${config.APP_PORT}/article/images/',file.filename)) FROM file WHERE a.id = file.article_id) images,
      CONCAT('${config.APP_HOST}:${config.APP_PORT}/article/',a.id) articleUrl
      FROM article a
      LEFT JOIN user u ON a.user_id = u.id
      LEFT JOIN profile p ON u.id = p.user_id
      LEFT JOIN article_tag ag ON a.id = ag.article_id
      LEFT JOIN tag ON tag.id = ag.tag_id
      WHERE a.id = ?
      GROUP BY a.id;`;
      const [result] = await connection.execute(statement, [articleId]); //拿到的元数据是数组,解构取得查询数据库结果,也是个数组
      return result[0]; //result就是我们真实查询结果,由于查询单个取第一个结果即可
    } catch (error) {
      console.log(error);
    }
  }

  async getArticleList(offset, size) {
    try {
      const statement = `
      SELECT a.id id,a.title title,a.content content,a.createAt createAt,a.updateAt updateAt,
      JSON_OBJECT('id',u.id,'name',u.name,'avatarUrl',p.avatar_url) author,
      (SELECT COUNT(al.user_id) FROM article
      LEFT JOIN article_like al ON article.id = al.article_id
      WHERE article.id = a.id) likes,
      (SELECT COUNT(*) FROM comment c WHERE c.article_id = a.id) commentCount,
      IF(COUNT(tag.id),JSON_ARRAYAGG(JSON_OBJECT('id',tag.id,'name',tag.name)),NULL) tags,
      (SELECT JSON_ARRAYAGG(CONCAT('${config.APP_HOST}:${config.APP_PORT}/article/images/',file.filename)) FROM file WHERE a.id = file.article_id) images,
      CONCAT('${config.APP_HOST}:${config.APP_PORT}/article/',a.id) articleUrl
      FROM article a
      LEFT JOIN user u ON a.user_id = u.id
      LEFT JOIN profile p ON u.id = p.user_id
      LEFT JOIN article_tag ag ON a.id = ag.article_id
      LEFT JOIN tag ON tag.id = ag.tag_id
      GROUP BY a.id
      LIMIT ?,?;`;
      const [result] = await connection.execute(statement, [offset, size]); //拿到的元数据是数组,解构取得查询数据库结果,也是个数组
      return result; //result就是我们真实查询结果,由于查询单个取第一个结果即可
    } catch (error) {
      console.log(error);
    }
  }

  async getTotal() {
    try {
      const statement = `SELECT COUNT(a.id) total FROM article a;`;
      const [result] = await connection.execute(statement); //拿到的元数据是数组,解构取得查询数据库结果,也是个数组
      return result[0];
    } catch (error) {
      console.log(error);
    }
  }

  async update(title, content, articleId) {
    try {
      const statement = `UPDATE article SET title = ?,content = ? WHERE id = ?;`;
      const [result] = await connection.execute(statement, [title, content, articleId]); //拿到的元数据是数组,解构取得查询数据库结果,也是个数组
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async delete(articleId) {
    try {
      const statement = `DELETE FROM article WHERE id = ?;`;
      const [result] = await connection.execute(statement, [articleId]); //拿到的元数据是数组,解构取得查询数据库结果,也是个数组
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async hasTag(articleId, tagId) {
    try {
      const statement = `SELECT * FROM article_tag WHERE article_id = ? AND tag_id = ?;`;
      const [result] = await connection.execute(statement, [articleId, tagId]);
      return result[0] ? true : false;
    } catch (error) {
      console.log(error);
    }
  }

  async addTag(articleId, tagId) {
    try {
      const statement = `INSERT INTO article_tag (article_id,tag_id) VALUES (?,?);`;
      const [result] = await connection.execute(statement, [articleId, tagId]);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new ArticleService();