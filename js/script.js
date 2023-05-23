var totalSkillPoints = 1199;  // 初始技能点数

function handleRightClick(event) {
    event.preventDefault();
    // 你的处理代码...
    console.log('右键被点击了');
}
// 页面加载完成时执行初始化
window.addEventListener('load', function() {
    updatePointValue();
});

function showSkillInfo(event) {
    // 获取技能信息
    var skillName = "Skill Name";
    var skillDescription = "Skill Description";

    // 获取卡片元素和鼠标位置
    var skillInfoCard = document.getElementById("skill-info-card");
    var mouseX = event.clientX + 30;
    var mouseY = event.clientY;

    // 更新卡片内容和位置
    var skillNameElement = document.getElementById("skill-name");
    var skillBaseCostElement = document.getElementById("skill-baseCost");
    var skillCostElement = document.getElementById("skill-cost");
    var skillLevelElement = document.getElementById("skill-level");

    skillNameElement.textContent = skillName;

    skillInfoCard.style.display = "block";
    skillInfoCard.style.left = mouseX + "px";
    skillInfoCard.style.top = mouseY + "px";
}

function hideSkillInfo() {
    var skillInfoCard = document.getElementById("skill-info-card");
    skillInfoCard.style.display = "none";
    console.log('鼠标离开技能'  );
}

function iconClick(skillId) {

    var skill = skills[skillId];
    if (skill.prerequisite && skills[skill.prerequisite].currentLevel == 0) {
        console.log('你需要先学习前置技能：' + skill.prerequisite);
        playFailAnimation(skillId);
        return;
    }
    
    var cost = skill.currentLevel === 0 ? skill.baseCost : skill.increaseCost;
    if (totalSkillPoints < cost) {
        console.log('技能点数不足，无法升级此技能');
        playFailAnimation(skillId);
        return;
    }
    
    if (skill.currentLevel >= skill.maxLevel) {
        console.log('此技能已达到最高等级');
        playFailAnimation(skillId);
        return;
    } 

    // 如果所有检查都通过，就可以升级这个技能
    totalSkillPoints -= cost;
    skill.currentLevel++;
    // 更新m2-1图标的等级
    var levelElementId = skillId + '-level';
    document.getElementById(levelElementId).textContent = skill.currentLevel;
    updateSkillIcons(); // 更新技能图标
    updatePointValue(); // 更新点数
    console.log('你已成功升级' + skillId + '到等级' + skill.currentLevel);
    console.log('剩余技能点数：' + totalSkillPoints);

    // var icon = document.getElementById(skillId).querySelector('.game-icon');
    // icon.classList.add("active");
  
    // // 在 0.5 秒后移除 "active" 类，以便重置特效状态
    // setTimeout(function() {
    //   icon.classList.remove("active");
    // }, 500);
    
    playSuccessAnimation(skillId)
}


function iconRightClick(skillId, event) {
    event.preventDefault();  // 阻止浏览器默认的右键菜单 

    var skill = skills[skillId];
    if (skill.currentLevel === 0) {
        // 移除已学习类 
        playFailAnimation(skillId);
        console.log('此技能当前等级已经为0');
        return;
    }

    var refundCost = skill.currentLevel === 1 ? skill.baseCost : skill.increaseCost;

    // 检查后续技能是否升级，如果有升级则无法降级
    var nextSkills = Object.values(skills).filter(s => s.prerequisite === skillId);
    var hasUpgrade = nextSkills.some(s => s.currentLevel > 0);
    if (hasUpgrade && skill.currentLevel == 1) {
        console.log('后续技能已经升级，无法降级此技能');
        return;
    }

    totalSkillPoints += refundCost;
    skill.currentLevel--;

    // 更新技能图标的等级
    var levelElementId = skillId + '-level';
    document.getElementById(levelElementId).textContent = skill.currentLevel;
    updateSkillIcons(); // 更新技能图标
    updatePointValue(); // 更新点数
    console.log('你已降级' + skillId + '到等级' + skill.currentLevel);
    console.log('返还技能点数：' + refundCost);
    console.log('剩余技能点数：' + totalSkillPoints);
}

function updateSkillIcons() {   
    var skillElements = document.querySelectorAll('.game-icon');
    for (var i = 0; i < skillElements.length; i++) {
      var skillId = skillElements[i].parentNode.id;
      var skill = skills[skillId];
      var levelElement = document.getElementById(skillId + '-level');
      if (levelElement && skill) {
        var currentLevel = skill.currentLevel;
        if (currentLevel === 0) {
          if (skill.prerequisite && skills[skill.prerequisite].currentLevel > 0) {
            // 修改图片路径为 /images/skill1/+原文件名
            skillElements[i].src = skillElements[i].src.replace(/(images\/)/, '$1skill1/');
          } else {
            // 移除 'skill1/' 或 'skill2/'
            skillElements[i].src = skillElements[i].src.replace(/(images\/)(skill1\/|skill2\/)?/, '$1');
          }
        } else {
          // 修改图片路径为 /images/skill2/+原文件名
          skillElements[i].src = skillElements[i].src.replace(/(images\/)/, '$1skill2/');
        }
      }
    }
  } 
  
// function playFailAnimation(skillId) {
//     var container = document.getElementById(skillId);
//     container.classList.add('fail');
//     setTimeout(function() {
//       container.classList.remove('fail');
//     }, 500);
//   }

function playFailAnimation(skillId) { 
    var img = document.querySelector('#' + skillId + ' img');
    img.classList.add('fail-animation');
    setTimeout(function() {
      img.classList.remove('fail-animation');
    }, 200);
  }
  
  
  function playSuccessAnimation(skillId) { 
    var img = document.querySelector('#' + skillId + ' img');
    img.classList.add('flash');
    setTimeout(function() {
      img.classList.remove('flash');
    }, 200);
  }
  
  function updatePointValue(){
      // 获取对元素的引用
      var pointsValueElement = document.getElementById("points-value");

      // 更新内容
      pointsValueElement.textContent = totalSkillPoints;
      console.log('更新页面点数：' + pointsValueElement.textContent);
  }