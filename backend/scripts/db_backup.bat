:: 데이터베이스를 백업 파일로 변환
@echo off
setlocal

:: mysql 접속 id 또는 Username 입력
set id=user
:: mysql 접속 Password 입력
set pw=q1w2e3r4

:: MySQL 설치 디렉터리 설정
set mysql_dir=C:\Program Files\MySQL\MySQL Server 8.0\bin\

:: 백업 파일을 저장할 디렉터리 설정
set backup_dir=C:\inetpub\root\backup_db\

:: MySQL 디렉터리로 이동
cd %mysql_dir%

:: 첫 번째 데이터베이스 백업
:: 백업할 데이터베이스 이름 설정
set db_name=employee_management_system
:: mysqldump를 사용하여 데이터베이스 백업 실행 및 파일로 저장
:: mysqldump -u[username] -p[database_name] > [filename].sql
mysqldump -u%id% -p%pw% --port 3307 %db_name% > %backup_dir%%db_name%_%date%.sql

pause