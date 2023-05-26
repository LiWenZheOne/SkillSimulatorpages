var initialSkillPoint = 1199

var totalSkillPoints = initialSkillPoint;  // 初始技能点数

function handleRightClick(event) {
    event.preventDefault(); 
}

// 页面加载完成时执行初始化
window.addEventListener('load', function () {
    updatePointValue();
});

function showSkillInfo(event) {
    // 获取当前悬停的元素和它的ID
    var targetElement = event.target;
    var skillId = event.target.getAttribute('onclick').split("'")[1];
    // 从skills对象中获取技能信息
    var skill = skills[skillId];
    var skillDescription = skills[skillId].desc;
    var baseCost = skills[skillId].baseCost;
    var increaseCost = skills[skillId].increaseCost;
    var currentLevel = skills[skillId].currentLevel;

    // 获取卡片元素和鼠标位置
    var skillInfoCard = document.getElementById("skill-info-card");
    var targetRect = targetElement.getBoundingClientRect();

    // 更新卡片内容和位置
    var skillNameElement = document.getElementById("skill-name");
    var skillBaseCostElement = document.getElementById("skill-baseCost");
    var skillCostElement = document.getElementById("skill-cost");
    var skillLevelElement = document.getElementById("skill-level");

    skillNameElement.textContent = skillDescription;
    skillBaseCostElement.textContent = baseCost;
    skillCostElement.textContent = increaseCost;
    skillLevelElement.textContent = currentLevel;

    skillInfoCard.style.display = "block";
    skillInfoCard.style.left = (targetRect.right + 10) + "px";
    skillInfoCard.style.top = targetRect.top + "px";
}


function hideSkillInfo() {
    var skillInfoCard = document.getElementById("skill-info-card");
    skillInfoCard.style.display = "none";
}

function iconClick(skillId) {

    var skill = skills[skillId];
    // if (skill.prerequisite && skills[skill.prerequisite].currentLevel == 0) {
    //     playSound("fail");
    //     playFailAnimation(skillId);
    //     return;
    // }
    if (skill.prerequisite) {
        var prerequisiteMet = false;
        var prerequisites = skill.prerequisite.split(',');

        prerequisiteMet = prerequisites.some(function (prerequisite) {
            return skills[prerequisite] && skills[prerequisite].currentLevel > 0;
        });
        // 如果没有满足的前置技能，则播放失败的声音和动画
        if (!prerequisiteMet) {
            console.log("先学前置")
            playSound("fail");
            playFailAnimation(skillId);
            return;
        }
    } 

    var cost = skill.currentLevel === 0 ? skill.baseCost : skill.increaseCost;
    if (totalSkillPoints < cost) {
        playSound("fail");
        playFailAnimation(skillId);
        return;
    }

    if (skill.currentLevel >= skill.maxLevel) {
        playSound("success");
        playFailAnimation(skillId);
        return;
    }

    // 如果所有检查都通过，就可以升级这个技能
    totalSkillPoints -= cost;
    skills[skillId].currentLevel++;

    syncSkillInfo(skill.skillid,skillId); // 同步技能信息
    updateSkillIcons(); // 更新技能图标
    updatePointValue(); // 更新点数
    playSound("success");

    // 成功特效
    playSuccessAnimation(skillId)
}


function iconRightClick(skillId, event) {
    event.preventDefault();  // 阻止浏览器默认的右键菜单 

    var skill = skills[skillId];
    if (skill.currentLevel === 0) {
        // 移除已学习类 
        playFailAnimation(skillId);
        playSound("fail");
        return;
    }

    var refundCost = skill.currentLevel === 1 ? skill.baseCost : skill.increaseCost;

// 检查后续技能是否升级，如果有升级则无法降级
    var nextSkills = Object.values(skills).filter(s => {
        // 如果 prerequisite 为空，直接返回 false
        if (!s.prerequisite) {
            return false;
        }
        var prerequisites = s.prerequisite.split(',');
        // 检查 skillId 是否在 prerequisites 数组中
        return prerequisites.includes(skillId);
    });
    var hasUpgrade = nextSkills.some(s => s.currentLevel > 0);
    if (hasUpgrade && skill.currentLevel == 1) {
        playFailAnimation(skillId);
        playSound("fail");
        return;
    }

    totalSkillPoints += refundCost;
    skill.currentLevel--;

    // 更新技能图标的等级
    syncSkillInfo(skill.skillid,skillId)
    updateSkillIcons(); // 更新技能图标
    updatePointValue(); // 更新点数
    playSound("back");
}

function syncSkillInfo(skillId,id) {
    let matchingSkills = [];
    for (let skill in skills) {
        if (skills.hasOwnProperty(skill) && skills[skill].skillid === skillId) {
            skills[skill].currentLevel = skills[id].currentLevel
            var levelElementId = skill + '-level';
            document.getElementById(levelElementId).textContent = skills[id].currentLevel;
            matchingSkills.push(skills[skill]);
        }
    }

    var skillLevelElement = document.getElementById("skill-level");
    skillLevelElement.textContent = skills[id].currentLevel;
}

function updateSkillIcons() {
    var skillElements = document.querySelectorAll('.game-icon');
    for (var i = 0; i < skillElements.length; i++) {
        var skillId = skillElements[i].parentNode.id;
        var skill = skills[skillId];
        var levelElement = document.getElementById(skillId + '-level');

        if (levelElement && skill) {
            var currentLevel = skill.currentLevel;
            var srcPath = skillElements[i].src;
            if (currentLevel === 0) {
                // var prerequisites = Array.isArray(skill.prerequisite) ? skill.prerequisite : [skill.prerequisite];
                if(skill.prerequisite){
                    var prerequisites = skill.prerequisite.split(',');
                    // 检查是否有满足的前置技能
                    var hasPrerequisite = prerequisites.some(function (prerequisite) {
                        return skills[prerequisite] && skills[prerequisite].currentLevel > 0;
                    });
                }

                if (hasPrerequisite && skill.prerequisite) {
                    srcPath = srcPath.replace(/(images\/)(skill1\/|skill2\/)?/, '$1')
                    srcPath = srcPath.replace(/(images\/)/, '$1skill1/');
                    if (srcPath !== skillElements[i].src){
                        skillElements[i].src = srcPath;
                    }

                } else {
                    srcPath = srcPath.replace(/(images\/)(skill1\/|skill2\/)?/, '$1')
                    if (srcPath !== skillElements[i].src){
                        skillElements[i].src = srcPath;
                    }
                }
            } else {
                srcPath = srcPath.replace(/(images\/)(skill1\/|skill2\/)?/, '$1')
                srcPath = srcPath.replace(/(images\/)/, '$1skill2/');
                if (srcPath !== skillElements[i].src){
                    skillElements[i].src = srcPath;
                }
            }
        }
    }
}

function refreshClick() {
    totalSkillPoints = initialSkillPoint;

    for (var key in skills) {
        if (skills.hasOwnProperty(key)) {
            var skill = skills[key];
            skill.currentLevel = 0;

        }
    }

    var levelIndicators = document.getElementsByClassName('level-indicator');
    for (var i = 0; i < levelIndicators.length; i++) {
        levelIndicators[i].textContent = '0';
    }

    updateSkillIcons(); // 更新技能图标
    updatePointValue(); // 更新点数
}

function playFailAnimation(skillId) {
    var img = document.querySelector('#' + skillId + ' img');
    img.classList.add('fail-animation');
    setTimeout(function () {
        img.classList.remove('fail-animation');
    }, 200);
}


function playSuccessAnimation(skillId) {
    var img = document.querySelector('#' + skillId + ' img');
    img.classList.add('flash');
    setTimeout(function () {
        img.classList.remove('flash');
    }, 200);
}

function updatePointValue() {
    // 获取对元素的引用
    var pointsValueElement = document.getElementById("points-value");

    // 更新内容
    pointsValueElement.textContent = totalSkillPoints;

}

function playSound(type) {
    if (type == "success") {
        var sound = document.getElementById('click-success-sound');
        sound.currentTime = 0;
        sound.play();
    } else {
        var sound = document.getElementById('click-back-sound');
        sound.currentTime = 0;
        sound.play();
    }
}