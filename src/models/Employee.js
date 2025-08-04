/**
 * Employee Model
 * 직원 데이터의 구조와 유효성 검사를 담당
 */
export class Employee {
  constructor(data = {}) {
    this.id = data.id || null
    this.name = data.name || ''
    this.department = data.department || ''
    this.position = data.position || ''
    this.email = data.email || ''
    this.phone = data.phone || ''
    this.address = data.address || ''
    this.birth = data.birth || ''
    this.photoUrl = data.photoUrl || null
    this.career_years = data.career_years || 0
    this.eus_career = data.eus_career || ''
    this.workplace = data.workplace || ''
    this.skills = data.skills || ''
    this.educations = data.educations || []
    this.certificates = data.certificates || []
    this.careers = data.careers || []
    this.projects = data.projects || []
  }

  // 유효성 검사
  validate() {
    const errors = []
    
    if (!this.name.trim()) {
      errors.push('이름은 필수입니다.')
    }
    
    if (!this.department.trim()) {
      errors.push('부서는 필수입니다.')
    }
    
    if (!this.position.trim()) {
      errors.push('직급은 필수입니다.')
    }
    
    if (this.email && !this.isValidEmail(this.email)) {
      errors.push('올바른 이메일 형식이 아닙니다.')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // 이메일 유효성 검사
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 경력 년수 포맷팅
  getFormattedCareer() {
    if (!this.career_years && this.career_years !== 0) {
      return '0년 0개월'
    }
    
    if (typeof this.career_years === 'number') {
      const years = Math.floor(this.career_years)
      const months = Math.floor((this.career_years - years) * 12)
      return `${years}년 ${months}개월`
    }
    
    return this.career_years.toString()
  }

  // JSON 직렬화
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      department: this.department,
      position: this.position,
      email: this.email,
      phone: this.phone,
      address: this.address,
      birth: this.birth,
      photoUrl: this.photoUrl,
      career_years: this.career_years,
      eus_career: this.eus_career,
      workplace: this.workplace,
      skills: this.skills,
      educations: this.educations,
      certificates: this.certificates,
      careers: this.careers,
      projects: this.projects
    }
  }
}

// 다른 모델들
export class Education {
  constructor(data = {}) {
    this.school = data.school || ''
    this.major = data.major || ''
    this.degree = data.degree || ''
    this.startDate = data.startDate || ''
    this.endDate = data.endDate || ''
    this.grade = data.grade || ''
  }
}

export class Certificate {
  constructor(data = {}) {
    this.name = data.name || ''
    this.issuer = data.issuer || ''
    this.issueDate = data.issueDate || ''
    this.expiryDate = data.expiryDate || ''
    this.score = data.score || ''
  }
}

export class Career {
  constructor(data = {}) {
    this.company = data.company || ''
    this.department = data.department || ''
    this.position = data.position || ''
    this.startDate = data.startDate || ''
    this.endDate = data.endDate || ''
    this.duties = data.duties || ''
  }
}

export class Project {
  constructor(data = {}) {
    this.name = data.name || ''
    this.client = data.client || ''
    this.role = data.role || ''
    this.startDate = data.startDate || ''
    this.endDate = data.endDate || ''
    this.technologies = data.technologies || ''
    this.description = data.description || ''
  }
}
