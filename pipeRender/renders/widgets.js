export function 移除无markdown挂件块(req, res, 渲染结果){
    console.log(渲染结果,渲染结果.querySelectorAll('div[data-type="NodeWidget"]'))
    渲染结果.querySelectorAll('div[data-type="NodeWidget"]').forEach(
        el=>{el.remove()}
    )
    return 渲染结果
}