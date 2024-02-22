const db = require("../db/connection");
const endpoints = require("../endpoints.json");

const selectTopics = () => {
  return db.query(`SELECT * FROM topics`).then((data) => {
    return data.rows;
  });
};

const getEndpoints = () => {
  return Promise.resolve({ endpoints });
};

const selectArticleById = (articleId) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then((article) => {
      if (article.rows[0] === undefined) {
        return Promise.reject();
      }
      return article.rows[0];
    });
};

const getArticles = () => {
  return db
    .query(
      `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, COUNT (comments.article_id):: INTEGER AS comment_count FROM comments RIGHT JOIN articles ON comments.article_id = articles.article_id
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC;`
    )
    .then((data) => {
      return data.rows;
    });
};


const getComment = (articleId) => {
  return db
    .query(`SELECT article_id FROM articles WHERE article_id = $1`, [articleId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject();
      } else {
        return db.query(
          `SELECT * FROM comments 
           WHERE article_id = $1
           ORDER BY created_at DESC`, 
          [articleId]
        );
      }
    })
    .then(({ rows }) => {
      return rows;
    });
  };

const addComment = ({ username, body }, articleId) => {
  return db
    .query(
      `
  INSERT INTO comments (author, body, article_id)
    VALUES ($1, $2, $3)
    RETURNING *`,
      [username, body, articleId]
    )
    .then((result) => {
      return result.rows[0];
    });
};

module.exports = {
  selectTopics,
  getEndpoints,
  selectArticleById,
  getArticles,
  getComment,
  addComment,
};
