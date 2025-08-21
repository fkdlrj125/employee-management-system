// backend/dto/EmployeeDTO.js

class EmployeeDTO {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.department = data.department;
    this.position = data.position;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.birth_date = data.birth_date;
    this.hire_date = data.hire_date;
    this.mitmas_career = data.mitmas_career;
    this.total_career = data.total_career;
    // /api/uploads/로 시작하면 /uploads/로 변환
    let photoUrl = data.photo_url;
    if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith('/api/uploads/')) {
      photoUrl = photoUrl.replace('/api/uploads/', '/uploads/');
    }
    this.photoUrl = photoUrl;
    this.eus_career = data.eus_career;
    this.workplace = data.workplace;
    this.skills = data.skills;
    // 관련 데이터(학력, 경력, 자격증, 프로젝트 등)는 별도 DTO로 분리 가능
    this.educations = data.educations;
    this.certifications = data.certifications;
    this.careers = data.careers;
    this.external_projects = data.external_projects;
    this.skillScores = data.skillScores;
    this.leaderSkillScores = data.leaderSkillScores;
    // 평가 점수 필드 추가
    this.member_total_score = data.member_total_score;
    this.leader_total_score = data.leader_total_score;
  }
}

module.exports = EmployeeDTO;
