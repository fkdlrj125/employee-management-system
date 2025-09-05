// 파일: scripts/rename-uploaded-photos.js
const fs = require('fs');
const path = require('path');
const { Sequelize, QueryTypes } = require('sequelize');
require('dotenv').config();

// DB 연결 정보 (최상단에 위치)
const sequelize = new Sequelize({
  username: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'employee_management_system',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    dialect: 'mysql',
    timezone: '+09:00',
    logging: false,
});

// 업로드 폴더 경로
const uploadDir = path.join(__dirname, '../uploads');

// 파일명 규칙 함수 (예시: file-타임스탬프-랜덤.png)
function getNewFileName(originalName) {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000000);
  return `file-${timestamp}-${random}${ext}`;
}

async function main() {
  const files = fs.readdirSync(uploadDir);

  for (const file of files) {
    const oldPath = path.join(uploadDir, file);
    const newFileName = getNewFileName(file);
    const newPath = path.join(uploadDir, newFileName);

    // 파일명 변경
    fs.renameSync(oldPath, newPath);

    // DB 업데이트
    const dbPath = `/uploads/${newFileName}`;
    await sequelize.query(
      'UPDATE Employees SET photo_url = :dbPath WHERE photo_url LIKE :oldPath',
      {
        replacements: { dbPath, oldPath: `%${file}` },
        type: QueryTypes.UPDATE,
      }
    );

    console.log(`파일명 변경: ${file} → ${newFileName}, DB 경로 수정 완료`);
  }

  await sequelize.close();
  console.log('작업 완료!');
}

main().catch(console.error);