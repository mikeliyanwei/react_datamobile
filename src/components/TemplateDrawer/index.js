import React ,{ Component } from 'react'
import { Button,List,Checkbox,Toast,Drawer } from 'antd-mobile';
import Super from './../../super'
const CheckboxItem = Checkbox.CheckboxItem;

export default class TemplateDrawer extends Component{

    componentDidMount(){
        this.props.onRef(this)
    }
    state={
        checkboxdata:[],
        fieldWords:"",
        showDrawer:false,  
        templateData:{},     
    }
    bodyScroll=(e)=>{
        e.preventDefault(); 
    }
    onOpenChange = (item) => {
        let {menuId}=this.props
        let {fieldWords,showDrawer}=this.state
        const stmplId=item.stmplId
        let newfields=""
        if(item.descs){ //获取字段名称
            item.descs.map((item)=>{
                newfields+=item.fieldName+","
                return false
            })
            if(!fieldWords){
                fieldWords=newfields
            }
            if(fieldWords && fieldWords!==newfields){
                fieldWords=newfields
            }
        }
        let excepts="" 
        if(item.array && item.array.length>0 ){ //获取排除的code
            item.array.map((item)=>{
                excepts+=item.code+","
                return false
            })
        }
        if(showDrawer){ //固定页面
            document.removeEventListener('touchmove', this.bodyScroll,  {passive: false}) 
            this.setState({ showDrawer:false,});
        }else{
            document.addEventListener('touchmove', this.bodyScroll,  {passive: false})
            Super.super({
                url:`/api/entity/curd/selections/${menuId}/${stmplId}`,  
                data:{
                    pageNo:1,
                    excepts
                }                
            }).then((res)=>{
                this.setState({
                    templateData:res,
                    showDrawer:true,
                    stmplId,
                    pageInfo:res.pageInfo,
                    excepts,
                    fieldWords,
                    menuId
                })
            })
        }       
    }
    handleDrawerOk=()=>{
        const {checkboxdata,fieldWords,stmplId,menuId}=this.state
        const codes=checkboxdata.join(",")
        Super.super({
            url:`/api/entity/curd/load_entities/${menuId}/${stmplId}`,  
            data:{
                codes,
                fields:fieldWords,
            }                
        }).then((res)=>{
            document.removeEventListener('touchmove', this.bodyScroll,  {passive: false}) 
            if(res.status==="suc"){
                this.props.loadTemplate(res,stmplId,codes)
                this.setState({
                    showDrawer:false,
                })
            }else{
                Toast.error(res.status)
            }
        })
    }
    changeCheckbox=(value)=>{
        const {checkboxdata}=this.state
        if(checkboxdata.length===0){
            checkboxdata.push(value)
        }else{
            let flag=-1
            checkboxdata.map((item,index)=>{
                if(item===value){
                    flag=index
                }
                return false
            })
            if(flag!==-1){
                checkboxdata.splice(flag,1)
            }else{
                checkboxdata.push(value)
            }
        }
        this.setState({
            checkboxdata,           
        })
    }
    goPage=(no)=>{
        const {pageInfo,menuId,stmplId,excepts}=this.state
        let data={}
        const topageNo=pageInfo.pageNo+no    
        data["pageNo"]=topageNo
        data["pageSize"]=pageInfo.pageSize
        data["excepts"]=excepts
        Super.super({
            url:`/api/entity/curd/selections/${menuId}/${stmplId}`,  
            data:data            
        }).then((res)=>{
            this.setState({
                templateData:res,
                showDrawer:true,
                pageInfo:res.pageInfo
            })
            window.scrollTo(0, 0)
        })
    }
    render(){
        const {showDrawer,pageInfo,templateData}=this.state
        const drawerData=templateData.entities
        const totalPage=pageInfo?Math.ceil(pageInfo.count/pageInfo.pageSize):""
        let sidebar=(<div>
                        <div className="drawerBtns">
                            <p>{pageInfo?`第${pageInfo.pageNo}页，共${pageInfo.count}条`:""}</p>
                            <Button type="warning" inline size="small" onClick={this.onOpenChange}>取消</Button>
                            <Button type="primary" inline size="small" onClick={this.handleDrawerOk}>确定</Button>
                        </div>
                        {
                            drawerData?drawerData.map((item,index)=>{
                                return  <List renderHeader={() => (index+1)} key={item.code}>
                                            <CheckboxItem 
                                            onChange={() => this.changeCheckbox(item.code)}
                                            >
                                            {
                                                item.fields.map((it)=>{
                                                    return <List.Item.Brief key={it.id}>{it.title}&nbsp;:&nbsp;{it.value}</List.Item.Brief>                                              
                                                })
                                            }
                                            </CheckboxItem>
                                        </List>
                            }):""
                        }
                        {pageInfo&&totalPage>=(pageInfo.pageNo+1)?
                        <Button onClick={()=>this.goPage(+1)}>点击加载下一页</Button>:
                        <p className="nomoredata">没有更多了···</p>}
                    </div>) 
        return (                        
            <Drawer
                className={showDrawer?"openDrawer":"shutDraw"}
                style={{ minHeight: document.documentElement.clientHeight-45 }}
                contentStyle={{ color: '#A6A6A6', textAlign: 'center', paddingTop: 42 }}
                sidebar={sidebar}
                open={showDrawer}
                position="right"
                touch={false}
                onOpenChange={this.onOpenChange}
            >
            &nbsp;
            </Drawer>
        )
    }
}
    