<template>
  <div id="protect-horse">
    <div id="audio-wrap">
      <audio ref="audioBgRef" :src="audioList['pvz-morning']" loop></audio>
      <audio ref="audioLevelRef" :src="audioList['pvz-comein']"></audio>
      <audio ref="audioSkillRef" :src="audioList[audioSkill]"></audio>
      <audio ref="audioEndRef" :src="audioList[audioEnd]"></audio>
    </div>
    <div class="game-wrap">
      <div class="canvas-wrap" @click="hiddenTowerOperation">
        <!-- 游戏顶部信息展示区域 -->
        <GameNavBar 
          :money="money"
          :addMoney="addMoney"
          :level="level"
          :isPause="isPause"
          :isPlayBgAudio="isPlayBgAudio"
          @gamePause="gamePause"
          @playBgAudio="playBgAudio"
        />
        <!-- 游戏区域 -->
        <canvas ref="canvasRef" id="mycanvas" :width="defaultCanvas.w" :height="defaultCanvas.h" @click="getMouse($event)"></canvas>
        <!-- 塔防的容器 -->
        <div v-show="building.isShow" class="building-wrap" :style="buildingStyle">
          <img src="./assets/img/add.png" alt="" class="add-icon">
          <div class="tower-wrap" :class="buildingClass">
            <div 
              class="tower" 
              :class="{'tower-no-money': money < item.money}" 
              v-for="(item, index) in towerList" 
              :key="index"
              @click="buildTower(index)"
            >
              <img :src="item.img" alt="" class="tower-icon">
              <div class="tower-info">￥{{item.money}}</div>
            </div>
          </div>
        </div>
        <!-- 塔防的攻击范围 -->
        <div v-show="buildingScope.isShow" class="building-scope" :style="buildingScopeStyle">
          <span class="sale-wrap" @click="saleTower(buildingScope.towerIndex)" :style="saleTowerStyle">
            <span class="iconfont icon-ashbin"></span>
            <span class="sale-num">{{tower[buildingScope.towerIndex] && tower[buildingScope.towerIndex].saleMoney}}</span>
          </span>
        </div>
        <!-- 游戏底部技能区 -->
        <Skill :skillList="skillList" :money="money" :isPause="isPause" @handleSkill="handleSkill" />
        <!-- 终点 -->
        <div v-if="terminal" class="terminal" :style="terminalStyle">
          <div class="hp">{{hp}}</div>
          <img class="terminal-icon" src="./assets/img/horse1.png" alt="">
          <img v-show="proMoney.isShow" class="money-icon" src="./assets/img/Sun.gif" alt="" @click="proMoneyClick">
        </div>
        <!-- 游戏开始遮罩层 -->
        <div v-if="isGameBeginMask" class="game-begin mask">
          <div class="info">
            <Loading v-if="!loadingDone" />
            <div v-else class="begin-wrap">
              <span class="icon-wrap" @click="beginGame">
                <span class="iconfont" :class="isPause ? 'icon-kaishi1' : 'icon-24gf-pause2'"></span>
              </span>
              <span class="begin-text">开始游戏</span>
            </div>
          </div>
        </div>
        <!-- 游戏结束遮罩层 -->
        <div v-if="isGameOver" class="gameover-wrap mask">
          <div class="info">你为了保卫大司马抵御了{{level}}波僵尸</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * 必要优化-待完成
 * 1.敌人图片翻转
 * 2.手机屏幕翻转兼容
 */
import Loading from '@/components/loading.vue'
import GameNavBar from '@/components/gameNavBar.vue'
import Skill from '@/components/skill.vue'
import _ from 'lodash'

import { limitRange, randomNum, createProbNum, waitTime } from '@/utils/tools'
import keepInterval from '@/utils/keepInterval'

import levelEnemyArr from '@/dataSource/levelEnemyArr'
import audioData from '@/dataSource/audioData'
import skillData from '@/dataSource/skillData'
import mapData, { mapGridInfoList } from '@/dataSource/mapData'

export default {
  name: 'protect-horse',
  components: {
    Loading,
    GameNavBar,
    Skill,
  },
  props: {
    mapLevel: {
      type: Number,
      default: 0
    },
    enemySource: {
      type: Array,
      default: () => []
    },
    towerList: {
      type: Array,
      default: () => []
    },
    imgOnloadObj: {
      type: Object,
      default: () => {}
    },
    towerOnloadImg: {
      type: Object,
      default: () => {}
    },
    towerBulletOnloadImg: {
      type: Object,
      default: () => {}
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 浏览器大小变化
      resizeTimer: null,
      // canvas 默认大小
      defaultCanvas: {w: 1050, h: 600},
      // canvas 对象
      canvas: {},
      // canvas 画布距离浏览器左边和顶部的距离
      canvasInfo: {left: 0, top: 0},
      // requestAnimationFrame api的保存对象
      animationFrame: null,
      // 得到 canvas 的 2d 上下文
      ctx: {},
      // 是否加载完成
      loadingDone: false,
      isGameBeginMask: true,
      // 游戏结束
      isGameOver: false,
      // 设置游戏的暂停
      isPause: true,
      // 等级
      level: 0,
      // 生命值
      hp: 10,
      // 金钱
      money: 600,
      // 增加的金钱
      addMoney: {num: '', timer: null, time: 1000},
      // 生产的金钱
      proMoney: {isShow: false, interval: 10000, money: 25},
      // 敌人生成间隔时间
      intervalTime: 900,
      // 当前等级需要的敌人索引
      levelEnemy: [],
      // 已上场的敌人数量
      createdEnemyNum: 0,
      // 场上的敌人数组  
      enemy: [],
      // 偏移量y 是用来计算敌人与地板底部的距离 (两个地板(50*2)-敌人(h(75)+y(10))) = 10
      offset: {y: 10},
      // 最小刻度
      minScale: 2,
      // 终点位置
      terminal: null,
      // 格子数量信息 arr: [[ 0:初始值(可以放塔)，1:地板，2:有阻挡物，10(有塔防：10塔防一，11塔防二...) ]]
      gridInfo: { x_num: 21, y_num: 12, size: 50, arr: [[]] },
      // 地板：大小 数量
      floorTile: {size: 50, num: 83},
      // 移动轨迹 [{x坐标, y坐标, x_y(方向): 1:左 2:下 3:右 4:上}]
      movePath: [],
      // 塔防
      building: { left: 0, top: 0, isShow: false },
      // 塔防攻击范围
      buildingScope: {left: 0, top: 0, r: 0, isShow: false, towerIndex: 0},
      // 场上的防御塔数组 {x, y, shootFn(防抖的射击函数), targetIndexList(攻击的目标):[], bulletArr(子弹数组)[x,y(子弹当前位置),addX,addY(往目标方向增加的值),xy(当前距离),x_y(目标距离),e_i(目标索引)], ...this.towerList[i], onload-img, onload-bulletImg
      tower: [],
      // 是否播放背景音乐
      isPlayBgAudio: false,
      // 所有音乐数据
      audioList: audioData,
      // 终点音乐
      audioEnd: '',
      // 当前技能音乐
      audioSkill: '',
      // 底部技能栏
      skillList: JSON.parse(JSON.stringify(skillData)),
      mapGridInfoItem: null,
    }
  },
  computed: {
    /** 终点位置 */
    terminalStyle() {
      const {x, y} = this.terminal
      return {left: x + 'px', top: y + 'px'}
    },
    /** 塔防容器的样式 */
    buildingStyle() {
      const {left, top} = this.building
      const size = this.gridInfo.size
      return {left: left + size + 'px', top: top + size + 'px'}
    },
    /** 塔防容器的类目 */
    buildingClass() {
      const {left, top} = this.building
      const {x_num, y_num, size} = this.gridInfo
      const _x_num = Math.round(left / size), _y_num = Math.round(top / size)
      let className = ''
      if(_y_num >= y_num - 3) {
        className += 'tower-wrap-bottom '
      }
      // 点击在左右两边的情况
      if(_x_num <= 1 || _x_num >= x_num - 2) {
        className += 'tower-wrap-row '
        if(_y_num >= 2) className += 'tower-wrap-row-top '
        if(_x_num <= 1) className += 'tower-wrap-left'
        else className += 'tower-wrap-right'
      }
      return className
    },
    /** 攻击范围的样式 */ 
    buildingScopeStyle() {
      const padding = this.gridInfo.size
      const size = this.gridInfo.size / 2
      const {left, top, r} = this.buildingScope
      return {left: left + padding + size + 'px', top: top + padding + size + 'px', width: r * 2 + 'px', height: r * 2 + 'px'}
    },
    /** 售卖防御塔按钮的样式 */
    saleTowerStyle() {
      const {y_num, size} = this.gridInfo
      const _y_num = Math.round(this.buildingScope.top / size)
      return _y_num >= y_num / 2 ? { top: 0 } : { bottom: 0 }
    },
    /** 是否是无限火力模式 */
    isInfinite() {
      return this.mapLevel === mapData.length - 1
    },
    /** 当前关卡全部敌人已经上场 */
    allEnemyIn() {
      return this.createdEnemyNum === this.levelEnemy.length
    }
  },
  watch: {
    // 监听增加的钱
    money(newVal, oldVal) {
      this.addMoney.num = ''
      clearTimeout(this.addMoney.timer)
      this.addMoney.timer = null
      this.$nextTick(() => {
        const val = newVal - oldVal
        this.addMoney.num = (val >= 0 ? '+' : '') + val
        this.addMoney.timer = setTimeout(() => {
          this.addMoney.num = ''
        }, this.addMoney.time);
      })
    },
    // 游戏结束判断
    hp(val) {
      if(!val) {
        this.isGameOver = true
        this.isPause = true
        this.playAudio('ma-gameover', 'Skill')
        this.$refs.audioBgRef.pause()
      }
    },
    // 暂停的判断
    isPause: {
      // immediate: true,
      handler(val) {
        keepInterval.allPause(val)
        if(!val) {
          this.makeEnemy()
          this.startAnimation();
          this.startMoneyTimer()
        }
      }
    },
    // 监听等级变化生成对应敌人
    level: {
      immediate: true,
      handler(val) {
        setTimeout(() => {
          this.createdEnemyNum = 0
          if(val < levelEnemyArr.length && !this.isInfinite) {
            this.levelEnemy = levelEnemyArr[val]
          } else {
            const list = [0]
            const isUpdate = (val / 2) > levelEnemyArr.length ? true : false
            const enemyNum = this.isInfinite ? parseInt((val + 1) * 5) : parseInt(val * 1.3)
            for(let i = 0; i < enemyNum; i++) {
              list.push(createProbNum(isUpdate))
            }
            this.levelEnemy = list
          }
          if(val) {
            if((val / 10) % 1 === 0) {
              this.playAudio('ma-pvz', 'End')
            }
            this.money += (this.level + 1) * this.proMoney.money
            this.makeEnemy()
            this.$refs.audioLevelRef.play()
          }
        }, val ? 500 : 0);
      },
    },
    enemy: {
      deep: true,
      handler(enemyList) {
        // 敌人已经清空
        if(!enemyList.length && this.allEnemyIn && this.hp) {
          this.$nextTick(() => { this.level++ })
        }
        const tower = this.tower
        for(let t_i in tower) {
          const eIdList = this.enterAttackScopeList(enemyList, tower[t_i])
          // 进入攻击范围，开始射击 
          if(eIdList.length) {
            tower[t_i].shootFun(eIdList.slice(0, tower[t_i].targetNum), t_i)
          }
        }
      }
    },
  },
  mounted() {
    this.init();
    this.getCanvasMargin()
    // 监听浏览器窗口大小变化
    window.addEventListener("resize", this.getCanvasMargin);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.getCanvasMargin)
    cancelAnimationFrame(this.animationFrame)
    keepInterval.clear()
  },
  methods: {
    async init() {
      if(this.isInfinite) {
        this.money = 999999
      }
      this.canvas = this.$refs.canvasRef;
      this.ctx = this.canvas.getContext("2d");
      this.mapGridInfoItem = JSON.parse(JSON.stringify(mapGridInfoList[this.mapLevel]))
      this.initMobileData()
      this.floorTile.num = this.mapGridInfoItem.num
      this.initAllGrid()
      this.initMovePath()
      this.onKeyDown()
      await waitTime(800)
      this.loadingDone = true
      this.startAnimation()
    },
    /** 点击获取鼠标位置 操作塔防 */
    getMouse(e) {
      e.stopPropagation()
      const size = this.gridInfo.size
      const _x = e.x - this.canvasInfo.left, _y = e.y - this.canvasInfo.top
      // 当前点击的格子的索引值
      const col = Math.floor(_y / size), row = Math.floor(_x / size)
      const gridVal = this.gridInfo.arr[col][row]
      const left = row * size, top = col * size
      // 已经有地板或者有建筑了
      if(gridVal >= 10) {
        this.handlerTower(left, top)
      }
      if(gridVal) {
        return
      }
      this.building.isShow = true
      this.building.left = left
      this.building.top = top
    },
    /** 点击建造塔防 */
    buildTower(index) {
      const { rate, money, audioKey } = this.towerList[index]
      if(this.money < money) return
      this.money -= money
      const {left: x, top: y} = this.building
      const size = this.gridInfo.size
      // 将该塔防数据放入场上塔防数组中
      // 射击的防抖函数
      const shootFun = _.throttle((eIdList, t_i) => {
        this.shootBullet(eIdList, t_i)
      }, rate, { leading: true, trailing: false })
      // 处理多个相同塔防的id值
      const id = Date.now()
      const tower = {x, y, id: audioKey + id, shootFun, targetIndexList: [], bulletArr: [], ...this.towerList[index], img: this.towerOnloadImg[index], bulletImg: this.towerBulletOnloadImg[index]}
      this.tower.push(tower)
      // 用于标记是哪个塔防 10 + index
      this.gridInfo.arr[y / size][x / size] = 10 + index
      this.drawTower(tower)
      this.createAudio(audioKey, id)
    },
    /** 售卖防御塔 */
    saleTower(index) {
      const size = this.gridInfo.size
      const {x, y, saleMoney, id} = this.tower[index]
      this.ctx.clearRect(x, y, size, size);
      this.gridInfo.arr[y / size][x / size] = 0
      this.money += saleMoney
      this.removeAudio(id)
      this.tower.splice(index, 1)
    },
    /** 点击背景 隐藏塔防 */
    hiddenTowerOperation() {
      if(this.building.isShow) this.building.isShow = false
      if(this.buildingScope.isShow) this.buildingScope.isShow = false
    },
    /** 处理塔防 */
    handlerTower(x, y) {
      // 当前点击的是哪个塔防
      const towerIndex = this.tower.findIndex(item => item.x === x && item.y === y)
      const {x:left, y:top, r} = this.tower[towerIndex]
      // 展示攻击范围
      this.buildingScope = {isShow: true, left, top, r, towerIndex}
    },
    /** 发射子弹  enemy:敌人索引数组，t_i:塔索引 */
    shootBullet(eIdList, t_i) {
      // 添加攻击目标的索引
      this.tower[t_i].targetIndexList = eIdList
      for(const e_id of eIdList) {
        const enemy = this.enemy.find(e => e.id === e_id)
        if(!enemy) break
        const {x, y, w, h} = enemy
        // 敌人中心坐标
        const _x = x + w / 2, _y = y + h / 2
        const {x: t_x, y: t_y, speed, name, id, isThrough } = this.tower[t_i]
        const size_2 = this.gridInfo.size / 2
        // 子弹初始坐标
        const begin = {x: t_x + size_2, y: t_y + size_2}
        // 两坐标间的差值
        const diff = {x: _x - begin.x, y: _y - begin.y}
        // 子弹和敌人的距离
        const distance = this.powAndSqrt(diff.x, diff.y)
        const addX = speed * diff.x / distance, addY = speed * diff.y / distance
        const bullet = {x: begin.x, y: begin.y, addX, addY, xy: 0, x_y: distance, e_id}
        if(isThrough) {
          bullet.attactIdSet = new Set()
        }
        this.tower[t_i].bulletArr.push(bullet)
        if(name === 'PDD') {
          this.playDomAudio(id, 0.4)
        }
      }
    },
    /** 开启动画绘画 */
    startAnimation() {
      const that = this;
      (function go() {
        that.startDraw();
        if (!that.isPause) {
          // 时间间隔为 1000/60 每秒 60 帧
          that.animationFrame = requestAnimationFrame(go);
        } else {
          cancelAnimationFrame(that.animationFrame)
        }
      })();
    },
    /** 开始绘画 */
    startDraw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawFloorTile()
      this.drawTower()
      // 循环静态图片数组画敌人形成gif效果
      for(let index = 0; index < this.enemy.length; index++) {
        const item = this.enemy[index]
        const res = this.moveEnemy(index)
        // 当敌人已经到达终点，后面就不执行了
        if(res) break
        this.drawEnemy(index)
        if(item.imgIndex === item.imgList.length - 1) this.enemy[index].imgIndex = 0
        else this.enemy[index].imgIndex++
      }
      this.drawAndMoveBullet()
    },
    /** 画地板 */
    drawFloorTile() {
      const size = this.gridInfo.size
      for(let f of this.movePath) {
        this.ctx.drawImage(this.imgOnloadObj.floorTile, f.x, f.y, size, size)
      }
    },
    /** 画塔防 */
    drawTower(item) {
      const size = this.gridInfo.size
      if(item) {
        this.ctx.drawImage(item.img, item.x, item.y, size, size)
      } else {
        for(const t of this.tower) {
          this.ctx.drawImage(t.img, t.x, t.y, size, size)
        }
      }
    },
    /** 画并处理子弹 */
    drawAndMoveBullet() {
      const e_idList = []
      for(const t_i in this.tower) {
        const t = this.tower[t_i]
        for(let b_i = t.bulletArr.length - 1; b_i >= 0; b_i--) {
          const {w, h} = t.bSize
          // 当前塔防的当前子弹
          const bItem = t.bulletArr[b_i]
          const {x, y, addX, addY, e_id, attactIdSet} = bItem
          // 重新计算子弹离敌人的距离
          const b_e_distance = this.bulletEnemyDistance(e_id, t_i, b_i)
          if(b_e_distance) {
            const {addX: _addX, addY: _addY, xy} = b_e_distance
            addX = _addX, addY = _addY
            bItem.addX = _addX
            bItem.addY = _addY
            bItem.x_y = xy
          }
          bItem.x += addX
          bItem.y += addY
          bItem.xy += t.speed
          // 穿透性塔防
          if(t.isThrough) {
            const newEid = this.handleThroughBulletEid({x, y, w, h, attactIdSet})
            if(newEid) bItem.e_id = newEid
          }
          let isAttact = t.isThrough && attactIdSet.has(e_id)
          let isDelete = false
          // 子弹击中敌人
          if(this.checkBulletInEnemy({x: bItem.x, y: bItem.y, w, h}, e_id) && !isAttact) {
            // 穿透性子弹击中敌人
            if(t.isThrough) bItem.attactIdSet.add(e_id)
            // 清除子弹
            if(!t.isThrough) {
              t.bulletArr.splice(b_i, 1)
              isDelete = true
            }
            // 敌人扣血
            const enemy = this.enemy.find(e => e.id === e_id)
            if(enemy) {
              enemy.hp.cur -= t.damage
              if(enemy.hp.cur <= 0) {
                this.money += enemy.reward
                e_idList.push(e_id)
                t.targetIndexList.splice(t.targetIndexList.findIndex(item => item === e_id), 1)
                if(t.name === '茄子') {
                  this.playDomAudio(t.id)
                }
              } else {
                // 判断减速
                if(t.slow) {
                  this.slowEnemy(e_id, t.slow)
                }
              }
            }
          } else {
            if(!isDelete && !t.isThrough && bItem.xy >= bItem.x_y) {
              t.bulletArr.splice(b_i, 1)
            }
            this.ctx.drawImage(t.bulletImg, x - w / 2, y - h / 2, w, h)
          }
          // 清除穿透性子弹
          if(t.isThrough && this.checkThroughBullet({x,y,w,h})) {
            t.bulletArr.splice(b_i, 1)
          }
        }
      }
      // 消灭敌人
      if(e_idList.length) {
        this.removeEnemy(e_idList)
      }
    },
    /** 减速敌人 t_slow: {num: 减速倍速(当为0时无法动), time: 持续时间} */
    slowEnemy(e_id, t_slow) {
      const e_i = this.enemy.findIndex(e => e.id === e_id)
      const { speed: e_speed, curSpeed } = this.enemy[e_i]
      // 当前已经被眩晕了不能减速了
      if(curSpeed === 0) return
      // 新增或重置减速定时器
      keepInterval.set(`slow-${e_id}`, () => {
        const newE_i = this.enemy.findIndex(e => e.id === e_id)
        if(this.enemy[newE_i]) {
          this.enemy[newE_i].curSpeed = e_speed
        }
        keepInterval.delete(`slow-${e_id}`)
      }, t_slow.time)
      // 减速敌人
      const newSpeed = t_slow.num ? e_speed / t_slow.num : t_slow.num
      if(newSpeed < curSpeed) {
        this.enemy[e_i].curSpeed = newSpeed
      }
    },
    /** 处理穿透性子弹攻击的下一个敌人 */
    handleThroughBulletEid(bItem) {
      const {x, y, w, h, attactIdSet} = bItem
      for(const eItem of this.enemy) {
        if(!attactIdSet.has(eItem.id) && this.checkBulletInEnemy({x,y,w,h}, eItem.id)) {
          return eItem.id
        }
      }
      return false
    },
    /** 判断穿透性子弹是否越界了 */
    checkThroughBullet(bItem) {
      let {x, y, w, h} = bItem
      const {w: canvasW, h: canvasH} = this.defaultCanvas
      x = x - w / 2, y = y - h / 2
      return x + w < 0 || y + h < 0 || x > canvasW || y > canvasH
    },
    /** 画敌人 */
    drawEnemy(index) {
      if(!this.enemy[index]) return
      const { x, y, w, h, imgList, imgIndex, hp, curSpeed, speed } = this.enemy[index]
      // 翻转图片
      // ctx.translate(200, 0);
      // imgList[imgIndex].scale(-1, 1)
      this.ctx.drawImage(imgList[imgIndex], x, y, w, h) 
      // 绘画减速效果
      if(curSpeed !== speed) {
        this.ctx.beginPath();
        this.ctx.arc(x + w / 2, y + h / 2, w / 5, 0, 2 * Math.PI, false)
        this.ctx.fillStyle = 'rgba(2, 38, 241, 0.3)'
        this.ctx.fill()
        this.ctx.strokeStyle = '#022ef1'
        this.ctx.stroke()
      }
      if(hp.cur === hp.sum) return
      // 绘画生命值
      const w_2 = w - hp.size
      this.ctx.fillStyle = '#0066a1'
      this.ctx.fillRect(x, y - hp.size, w_2, hp.size)
      this.ctx.fillStyle = '#49ca00'
      this.ctx.fillRect(x, y - hp.size,  w_2 * hp.cur / hp.sum, hp.size)
      // 画边框
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "#cff1d3"; //边框颜色
      this.ctx.rect(x, y - hp.size, w_2, hp.size);  //透明无填充
      this.ctx.stroke();
    },
    /** 敌人移动 */
    moveEnemy(index) {
      const { w, h, curSpeed, speed, curFloorI, id } = this.enemy[index]
      // 敌人到达终点
      if(curFloorI === this.floorTile.num - 1) {
        this.removeEnemy([id])
        this.hp -= 1
        this.playAudio('ma-nansou', 'End')
        return true
      }
      const size = this.gridInfo.size
      // 将格子坐标同步到敌人的坐标
      const { x, y, x_y } = this.movePath[curFloorI]
      // 敌人需要站在地板中间区域
      const _y = y - (size - (size * 2 - h - this.offset.y))
      const _x = x - (w - size)
      switch (x_y) {
        case 1: this.enemy[index].x -= curSpeed; break;
        case 2: this.enemy[index].y -= curSpeed; break;
        case 3: this.enemy[index].x += curSpeed; break;
        case 4: this.enemy[index].y += curSpeed; break;
      }
      const { x: eX, y: eY } = this.enemy[index]
      // 敌人到达下一个格子
      if((eX >= _x &&  eX <= _x + speed) && (eY >= _y &&  eY <= _y + speed)) {
        this.enemy[index].curFloorI++
      }
    },
    /** 按间隔时间生成敌人 */
    makeEnemy() {
      // 当前关卡敌人已经全部上场
      if(this.allEnemyIn) return
      // 暂停回来，间隔时间修改
      keepInterval.set('makeEnemy', () => {
        if(this.allEnemyIn) {
          keepInterval.delete('makeEnemy')
        } else {
          this.setEnemy()
        }
      }, this.intervalTime)
    },
    /** 生成敌人 */
    setEnemy() {
      const enemyItem = _.cloneDeep(this.enemySource[this.levelEnemy[this.createdEnemyNum]])
      const size = this.gridInfo.size
      const {audioKey, name, h} = enemyItem
      // 设置敌人的初始位置
      const {x, y} = this.mapGridInfoItem
      enemyItem.x = x
      enemyItem.y = y - (size - (size * 2 - h - this.offset.y))
      const id = Date.now()
      enemyItem.id = audioKey + id
      this.enemy.push(enemyItem)
      this.createdEnemyNum++
      this.handleEnemySkill(name, enemyItem.id)
      this.createAudio(audioKey, id)
    },
    /** 处理敌人技能 */
    handleEnemySkill(enemyName, e_id) {
      const e_i = this.enemy.findIndex(e => e.id === e_id)
      if(!this.enemy[e_i].skill) return
      // 有技能的敌人
      const {time} = this.enemy[e_i].skill
      keepInterval.set(e_id, () => {
        this.setEnemySkill(enemyName, e_id)
      }, time)
    },
    /** 设置敌人技能 */
    setEnemySkill(enemyName, e_id) {
      const e_i = this.enemy.findIndex(e => e.id === e_id)
      if(!this.enemy[e_i] || !this.enemy[e_i].skill) return
      const {curFloorI: _curFloorI, id, hp} = this.enemy[e_i]
      let volume = 1
      // 舞王僵尸技能
      if(enemyName === '舞王') {
        const total = this.floorTile.num - 1
        for(let i = 0; i < 4; i++) {
          const newEnemy = _.cloneDeep(this.enemySource[12])
          switch (i) {
            case 0: newEnemy.curFloorI = limitRange(_curFloorI - 2, 1, total); break;
            case 1: newEnemy.curFloorI = limitRange(_curFloorI - 1, 1, total); break;
            case 2: newEnemy.curFloorI = limitRange(_curFloorI + 1, 1, total); break;
            case 3: newEnemy.curFloorI = limitRange(_curFloorI + 2, 1, total); break;
          }
          this.enemy.push(this.callEnemy(newEnemy, i))
        }
      } else if(enemyName === '弗利萨') {
        const total = this.floorTile.num - 1
        for(let i = 0; i < 2; i++) {
          const newEnemy = _.cloneDeep(this.enemySource[13])
          switch (i) {
            case 0: newEnemy.curFloorI = limitRange(_curFloorI - 2, 1, total); break;
            case 1: newEnemy.curFloorI = limitRange(_curFloorI - 1, 1, total); break;
          }
          this.enemy.push(this.callEnemy(newEnemy, i))
        }
      } else if(enemyName === '坤坤') {
        const newHp = hp.cur + 200
        this.enemy[e_i].hp.cur = limitRange(newHp, newHp, hp.sum)
        volume = 0.7
      }
      this.playDomAudio(id, volume)
    },
    /** 召唤敌人的处理 */
    callEnemy(newEnemy, i) {
      const size = this.gridInfo.size
      const { curFloorI, w, h, audioKey } = newEnemy
      const { x, y } = this.movePath[curFloorI - 1]
      const id = Date.now() + i
      newEnemy.id = audioKey + id
      newEnemy.x = x - (w - size)
      newEnemy.y = y - (size - (size * 2 - h - this.offset.y))
      return newEnemy
    },
    /** 消灭敌人 */
    removeEnemy(e_idList) {
      if(!e_idList.length) return
      const eiList = Array.from(e_idList.reduce((pre, id) => {
        const e_i = this.enemy.findIndex(e => e.id === id)
        if(e_i !== -1) pre.add(e_i)
        return pre
      }, new Set([])))
      eiList.sort((a, b) => b - a)
      // 这里会有执行时机的问题
      try {
        for(const e_i of eiList) {
          if(!this.enemy[e_i]) return
          const e_id = this.enemy[e_i].id
          // 清除减速持续时间定时器
          keepInterval.delete(`slow-${e_id}`)
          if(this.enemy[e_i].skill) {
            keepInterval.delete(e_id)
          }
          // 清除穿透子弹攻击过的目标id
          for(const t of this.tower) {
            if(t.isThrough) {
              for(const b of t.bulletArr) {
                b.attactIdSet.delete(e_id) 
              }
            }
          }
          this.removeAudio(e_id)
          this.enemy.splice(e_i, 1)
        }
      } catch (error) {
        console.log('error: ', error);
      }
    },
    /** 发动技能 */
    handleSkill(index) {
      const { name, money, damage, audioKey, showTime, cd } = this.skillList[index]
      this.money -= money
      if(name !== '礼物') {
        const e_idList = []
        for(const enemy of this.enemy) {
          const e_id = enemy.id
          enemy.hp.cur -= damage
           if(enemy.hp.cur <= 0) {
            this.money += enemy.reward
            e_idList.push(e_id)
            // 遍历清除防御塔里的该攻击目标
            for(const t of this.tower) {
              t.targetIndexList.splice(t.targetIndexList.findIndex(item => item === e_id), 1)
            }
          }
          if(name === "肉弹冲击") {
            this.slowEnemy(e_id, {num: 0, time: 6000})
          }
        }
        this.removeEnemy(e_idList)
      } else {
        this.money += randomNum(1, 100)
      }
      this.playAudio(audioKey, 'Skill')
      // 显示技能效果
      this.skillList[index].isShow = true
      setTimeout(() => {
        this.skillList[index].isShow = false
      }, showTime);
      // 技能进入cd
      this.skillList[index].curTime = cd 
      const skillId = `skill-${name}`
      keepInterval.set(skillId, () => {
        this.skillList[index].curTime -= 1000
        if(this.skillList[index].curTime <= 0) {
          keepInterval.delete(skillId)
        }
      })
    },
    /** 初始化所有格子 */
    initAllGrid() {
      const { x_num, y_num } = this.gridInfo
      const arr = []
      for(let i = 0; i < x_num; i++) {
        arr.push([])
        for(let j = 0; j < y_num; j++) {
          arr[i][j] = 0
        }
      }
      this.gridInfo.arr = arr
    },
    /** 初始化行动轨迹 */
    initMovePath() {
      const size = this.gridInfo.size
      // 刚开始就右移了，所有该初始格不会算上去
      const movePathItem = JSON.parse(JSON.stringify(this.mapGridInfoItem))
      delete movePathItem.num
      const movePath = []
      // 控制x y轴的方向 1:左 2:下 3:右 4:上
      let x_y = movePathItem.x_y
      for(let i = 0; i < this.floorTile.num; i++) {
        const newXY = mapData[this.mapLevel][i]
        if(newXY) {
          x_y = newXY
        }
        if(x_y % 2) movePathItem.x += x_y === 3 ? size : -size
        else movePathItem.y += x_y === 4 ? size : -size
        movePathItem.x_y = x_y
        movePath.push(JSON.parse(JSON.stringify(movePathItem)))
        this.gridInfo.arr[movePathItem.y / size][movePathItem.x / size] = 1
      }
      this.terminal = movePath[movePath.length - 1]
      this.movePath = movePath
    },
    /** 开启创建金钱定时器 */
    startMoneyTimer() {
      keepInterval.set('startMoneyTimer', () => {
        this.proMoney.isShow = true
        this.playAudio('ma-qifei', 'End')
        keepInterval.delete('startMoneyTimer')
      }, this.proMoney.interval)
    },
    /** 点击了生产出来的金钱 */
    proMoneyClick() {
      this.proMoney.isShow = false
      this.money += this.proMoney.money
      this.startMoneyTimer()
    },
    /** 获取canvas与浏览器 左边 / 顶部 的距离 */
    getCanvasMargin() {
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        this.canvasInfo.left = this.$refs.canvasRef.getBoundingClientRect().left;
        this.canvasInfo.top = this.$refs.canvasRef.getBoundingClientRect().top;
      }, 50);
    },
    /** 返回进入攻击范围的值的数组 */
    enterAttackScopeList(enemyList, tower) {
      const list = enemyList.reduce((pre, enemy) => {
        if(this.checkValInCircle(enemy, tower)) {
          pre.push({curFloorI: enemy.curFloorI, id: enemy.id})
        }
        return pre
      }, [])
      list.sort((a, b) => b.curFloorI - a.curFloorI)
      return list.map(item => item.id)
    },
    /** 
     * 计算子弹和敌人的距离
     * 返回 x,y方向需要增加的值， xy: 塔和敌人的距离
     */
    bulletEnemyDistance(e_id, t_i, b_i) {
      const enemy = this.enemy.find(e => e.id === e_id)
      // 敌人已经死了 或者 是能穿透的子弹，不用覆盖之前的值了 
      if(!enemy || this.tower[t_i].isThrough) return
      const size_2 = this.gridInfo.size / 2
      const {x, y, w, h} = enemy
      // 敌人中心坐标
      const _x = x + w / 2, _y = y + h / 2
      const { speed, bulletArr, x: tx, y: ty } = this.tower[t_i]
      // 两坐标间的差值
      const diff = {x: _x - bulletArr[b_i].x, y: _y - bulletArr[b_i].y}
      // 子弹和敌人的距离
      const distance = this.powAndSqrt(diff.x, diff.y)
      return {
        addX: speed * diff.x / distance, addY: speed * diff.y / distance, xy: this.powAndSqrt(_x - (tx + size_2), _y - (ty + size_2))
      }
    },
    /** 判断敌人中心是否在子弹中 即击中敌人 */
    checkBulletInEnemy({x, y, w, h}, e_id) {
      const enemy = this.enemy.find(e => e.id === e_id)
      if(!enemy) return
      const {x:ex, y:ey, w:ew, h:eh} = enemy
      // 绘画子弹时的偏移
      x -= w / 2, y -= h / 2
      // 敌人中心
      const _ex = ex + ew / 2, _ey = ey + eh / 2
      return _ex > x && _ey > y && (_ex < x + w) && (_ey < y + h)
    },    
    /** 判断值是否在圆内 */
    checkValInCircle(enemy, tower) {
      const {x, y, w, h} = enemy
      const angleList = [
        this.calculateDistance(tower, x, y),
        this.calculateDistance(tower, x + w, y),
        this.calculateDistance(tower, x + w, y + h),
        this.calculateDistance(tower, x , y + h),
      ]
      return angleList.some(item => item <= tower.r)
    },
    /** 计算点到圆心的距离之间的距离 */
    calculateDistance(tower, x, y) {
      const {x: _x, y: _y} = tower
      const size_2 = this.gridInfo.size / 2
      return this.powAndSqrt(_x + size_2 - x, _y + size_2 - y)
    },
    /** 两值平方相加并开方 求斜边 */
    powAndSqrt(val1, val2) {
      return Math.sqrt(Math.pow(val1, 2) + Math.pow(val2, 2))
    },
    /** 生成音频播放器 */
    createAudio(audioKey, id) {
      if(!this.audioList[audioKey]) return
      // var audio = new Audio()
      const audioWrap = document.querySelector('#audio-wrap')
      const audio = document.createElement('audio') //生成一个audio元素 
      audio.src = this.audioList[audioKey]  //音乐的路径
      audio.id = audioKey + id
      audioWrap.appendChild(audio)  //把它添加到页面中
    },
    /** 清除音频播放器 */
    removeAudio(id) {
      // 删除该 video dom 节点
      const videoDom = document.querySelector(`#${id}`)
      if(videoDom) {
        videoDom.remove()
      }
    },
    /** 播放背景音乐 */
    playBgAudio() {
      this.isPlayBgAudio = !this.isPlayBgAudio
      if(this.isPlayBgAudio) {
        this.$refs.audioBgRef.volume = 0.65
        this.$refs.audioBgRef.play()
      }
      else this.$refs.audioBgRef.pause()
    },
    /** 播放音乐 */
    playAudio(audioKey, key) {
      const audio_key = `audio${key}`
      if(this[audio_key] === undefined) return
      if(this[audio_key] !== audioKey) {
        this[audio_key] = audioKey
      }
      this.$nextTick(()=>{
        // 调节音量
        this.$refs[`${audio_key}Ref`].volume = 0.9
        this.$refs[`${audio_key}Ref`].play()
      })
    },
    /** 播放创建出来的dom(防御塔和僵尸)的音乐 */
    playDomAudio(id, volume) {
      const audioWrap = document.querySelector('#audio-wrap')
      const audioDom = audioWrap.querySelector(`#${id}`)
      if(!audioDom) return
      audioDom.play()
      audioDom.volume = volume || 1
    },
    /** 移动端按比例缩放数据 */
    initMobileData() {
      if(!this.isMobile) return
      console.log('this.isMobile: ', this.isMobile);
      const p = 0.4
      function handleDecimals(val) {
        return val * (p * 1000) / 1000
      }
      this.gridInfo.size *= p
      this.offset.y *= p
      this.defaultCanvas.w *= p
      this.defaultCanvas.h *= p
      this.mapGridInfoItem.x *= p
      this.mapGridInfoItem.y *= p
      this.enemySource.forEach(item => {
        item.w = handleDecimals(item.w)
        item.h = handleDecimals(item.w)
        item.curSpeed = handleDecimals(item.curSpeed)
        item.speed = handleDecimals(item.speed)
        item.hp.size = handleDecimals(item.hp.size)
      })
      this.towerList.forEach(item => {
        item.r = handleDecimals(item.r)
        item.speed = handleDecimals(item.speed)
        item.bSize.w = handleDecimals(item.bSize.w)
        item.bSize.h = handleDecimals(item.bSize.h)
      })
    },
    /** 监听用户的键盘事件 */
    onKeyDown() {
      document.onkeydown = (e) => {
        if(this.isGameBeginMask) return
        switch (e.code) {
          case "Space":{
            this.gamePause()
            break;
          } 
        }
      };
    },
    /** 开始游戏 */
    beginGame() {
      this.$refs.audioLevelRef.play()
      this.playBgAudio()
      this.isGameBeginMask = false
      this.isPause = false
      this.$message({type: 'success', message: '点击右上方按钮或按空格键继续 / 暂停游戏', duration: 2500, showClose: true})
    },
    /** 游戏暂停 */
    gamePause() {
      if(!this.isGameOver) {
        this.isPause = !this.isPause;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/style.scss';
#protect-horse {
  .game-wrap {
    position: relative;
    display: inline-block;
    padding: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid #eee;
    border-radius: 8px;
    .canvas-wrap {
      position: relative;
      padding: $size;
      background-image: radial-gradient(circle 500px at center, #16d9e3 0%, #30c7ec 47%, #46aef7 100%);
      border-radius: 4px;
      overflow: hidden;
      .building-wrap {
        position: absolute;
        user-select: none;
        .add-icon {
          width: $size;
          height: $size;
        }
        .tower-wrap {
          position: absolute;
          top: calc($size + 8px);
          left: calc(50% - ($size * 2 + $size / 2));
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(4, $size);
          grid-template-rows: repeat(2, $size);
          background: rgba(255, 255, 255, .4);
          border-radius: 16px;
          padding: 10px;
          z-index: 99;
          .tower {
            position: relative;
            width: $size;
            height: $size;
            border-radius: 8px;
            border: 2px solid #fff;
            margin-bottom: 10px;
            box-sizing: border-box;
            overflow: hidden;
            .tower-icon {
              width: 100%;
              height: 100%;
            }
            .tower-info {
              position: absolute;
              left: 0;
              right: 0;
              bottom: 0;
              text-align: center;
              font-size: calc($size * 0.26);
              color: #fff;
              background: rgba(0, 0, 0, .4);
            }
          }
          .tower-no-money {
            opacity: .3;
          }
        }
        .tower-wrap-row {
          grid-template-rows: repeat(4, $size);
          grid-template-columns: repeat(2, $size);
          grid-auto-flow: column;
          width: auto;
          .tower {
            margin-bottom: 0;
            margin-right: 10px;
          }
        }
        .tower-wrap-row-top {
          top: calc(50% - ($size * 2 + $size / 2));
        }
        .tower-wrap-left {
          left: calc($size + 8px);
        }
        .tower-wrap-right {
          right: calc($size + 8px);
          left: auto;
        }
        .tower-wrap-bottom {
          bottom: calc($size + 8px);
          top: auto;
        }
      }
      .building-scope {
        position: absolute;
        z-index: 1;
        transform: translate(-50%, -50%);
        box-sizing: border-box;
        border: 2px solid #3b9bdf;
        border-radius: 50%;
        background: rgba(255, 255, 255, .25);
        .sale-wrap {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          justify-content: center;
          align-items: center;
          // background: rgba(255, 255, 255, 0.4);
          background: #3b9bdf;
          color: #fff;
          border-radius: 8px;
          padding: 0 5px;
          cursor: pointer;
          &:hover {
            opacity: .75;
          }
          .iconfont {
            font-size: 20px;
          }
          .sale-num {
            font-size: 14px;
          }
        }
      }
      .terminal {
        position: absolute;
        user-select: none;
        cursor: pointer;
        // box-shadow: 0 0 2px 2px rgba(255, 255, 255, .3);
        .hp {
          color: #f24410;
          font-size: 18px;
          font-weight: bold;
          text-align: center;
        }
        .terminal-icon {
          display: block;
          width: calc($size * 2.5);
        }
        .money-icon {
          position: absolute;
          top: 0;
          left: 0;
          width: calc($size * 1.6);
          height: calc($size * 1.6);
        }
      }
      .gameover-wrap {
        .info {
          font-size: 36px;
          font-weight: bold;
          color: #fff;
        }
      }
      .game-begin {
        .info {
          .begin-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            .icon-wrap {
              display: inline-block;
              display: flex;
              justify-content: center;
              align-items: center;
              width: calc($size * 3);
              height: calc($size * 3);
              border-radius: 50%;
              background-image: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
              cursor: pointer;
              user-select: none;
              &:hover {
                opacity: .95;
                box-shadow: 0 0 16px 4px #3393e7;
              }
              .iconfont {
                color: #fff;
                font-size: calc($size * 1.6);
                animation: pulse 2s linear infinite;
              }
              @keyframes pulse {
                70% {
                  transform: scale(1.2);
                  opacity: 0.4;
                }
                100% {
                  transform: scale(1.2);
                  opacity: 0;
                }
              }
            }
            .begin-text {
              font-size: 36px;
              color: #fff;
              font-weight: bold;
              margin-top: 16px;
              letter-spacing: 8px;
              margin-left: 8px;
              user-select: none;
            }
          }
        }
      }
      .mask {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(0, 0, 0, .4);
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
</style>
