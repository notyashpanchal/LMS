import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node"



const { Video } = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function DELETE(
    req : Request,
    { params } : { params : {chapterId : string, courseId : string } }
){
    try {
        const {userId} = await auth();
        const {courseId} = params;

        console.log("Received courseId:", courseId);

        if (!userId) {
            return new NextResponse("Unauthorized", {status:401})
        }

        const course = await db.course.findUnique({
            where : {
                id : params.courseId,
                userId : userId
            },
            include :{ 
                chapter : {
                    include : {
                        muxData : true
                    }
                }
            }
        });

        if (!course) {
            return new NextResponse("Not found", {status:404})
        }

        for(const chapter of course.chapter) {
            if (chapter.muxData?.assetId) {
                await Video.Assets.del(chapter.muxData.assetId);
            }
        }

        const deletedCourse = await db.course.delete({
            where : { 
                id : params.courseId
            }
        })

        return NextResponse.json(deletedCourse)
        
    } catch (error) {
        console.log("[COURSE_ID]", error);
        return new NextResponse("Internal Error", {status:500})
    }
}


export async function PATCH(
    req:Request,
    {params} : {params:{courseId:string}}

) {
    try {
        const {userId} = await auth();
        const {courseId} = params;

        console.log("Received courseId:", courseId);

        const values = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", {status:401})
        }

        const course = await db.course.update({
            where : {
                id : courseId,
                userId
            },
            data :{ 
                ...values,
            }
        });

        return NextResponse.json(course);

        } catch (error) {
        console.log("[COURSE_ID]", error);
        return new NextResponse("Internal Error", {status:500})
    }
}