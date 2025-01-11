import './style.css'
import { Creature, Glob } from './modules/utilities'

const world = document.getElementById('container')
const glob = new Glob(world)
const addBtn = document.getElementById('add-creature')


addBtn?.addEventListener('click',(e) => {
    let c = new Creature(glob)
    glob.addObject(c)

})

glob.run()
