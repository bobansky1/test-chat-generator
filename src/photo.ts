// Judge the displayed image at full bubble width, not its source resolution.
export function isTallPhoto(width:number,height:number,availableWidth:number){
 return width>0&&height>0&&availableWidth>0&&availableWidth*height/width>400;
}
