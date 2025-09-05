const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

// 환경변수에서 DB 정보 읽기 (.env 파일 활용)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'employee_management_system',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3307,
  charset: 'utf8mb4',
};

// 이미지 폴더 경로 (backend/public/image)
const IMAGE_DIR = '/app/uploads';

async function main() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // DB에서 참조 중인 파일명 목록 조회
    const [rows] = await connection.execute('SELECT photo_url FROM employees');
    const usedFiles = new Set(
      rows
        .map(r => r.photo_url)
        .filter(Boolean)
        .map(url => path.basename(url)) // 파일명만 추출
    );
    // 디폴트 이미지 제외
    usedFiles.add('default-profile.png');
    // 실제 파일 목록
    const files = fs.readdirSync(IMAGE_DIR);
    let deleted = 0;
    for (const file of files) {
      if (!usedFiles.has(file)) {
        const filePath = path.join(IMAGE_DIR, file);
        fs.unlinkSync(filePath);
        deleted++;
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    if (connection) await connection.end();
  }
}

main();