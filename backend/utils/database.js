const mysql = require('mysql2/promise');
require('dotenv').config();

// 데이터베이스 연결 설정 (환경변수 우선)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'employee_management_system',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  charset: 'utf8mb4',
  timezone: '+09:00',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 연결 풀 생성
const pool = mysql.createPool(dbConfig);

// 연결 테스트 함수
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const [versionResult] = await connection.execute('SELECT VERSION() as version');
    connection.release();
    return { success: true, version: versionResult[0].version };
  } catch (error) {
    return { success: false, error };
  }
}

// undefined 값을 null로 변환
function replaceUndefinedWithNull(value) {
  if (value === undefined) return null;
  if (Array.isArray(value)) {
    return value.map(item => replaceUndefinedWithNull(item));
  }
  if (value && typeof value === 'object') {
    const result = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = replaceUndefinedWithNull(value[key]);
      }
    }
    return result;
  }
  return value;
}

// 쿼리 실행 함수
async function executeQuery(sql, params = []) {
  try {
    const cleanedParams = replaceUndefinedWithNull(params);
    const [rows] = await pool.execute(sql, cleanedParams);
    return { success: true, data: rows };
  } catch (error) {
    return { success: false, error };
  }
}

// 트랜잭션 실행 함수
async function executeTransaction(queries) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const results = [];
    for (const query of queries) {
      const [rows] = await connection.execute(query.sql, query.params || []);
      results.push(rows);
    }
    await connection.commit();
    return { success: true, data: results };
  } catch (error) {
    await connection.rollback();
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testConnection,
  executeQuery,
  executeTransaction,
  replaceUndefinedWithNull
};
