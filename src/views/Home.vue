<template>
  <div class="home">
    <h1>직원 관리 시스템</h1>
    <div class="card-container">
      <div class="card" @click="$router.push('/employee')">
        <h2>직원 관리</h2>
        <p>직원 정보 조회 및 관리</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
};
</script>

<style scoped>
.home {
  text-align: center;
  padding: 20px;
}

.card-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin: 10px;
  width: 200px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
}

h2 {
  color: #42b983;
  margin-bottom: 10px;
}
</style>
