import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
    req : Request,
    { params } : { params : { courseId : string } }
){
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status : 401 } );
        }

        const course = await db.course.findUnique({
            where : {
                id : params.courseId,
                userId
            },
            include : {
                chapter : {
                    include : {
                        muxData : true
                    }
                }
            }
        });

        if (!course) {
            return new NextResponse("Not Found", { status : 404})
        }

        const hasPublishedChapter = course.chapter.some((chapter) => chapter.isPublished);

        if (!course.title || !course.description || !course.imageUrl || !course.categoryId || !hasPublishedChapter) {
            return new NextResponse("Missing required Fields", { status : 404 } )
        }


        const publishedCourse = await db.course.update({
            where : {
                id : params.courseId,
                userId
            },
            data :{
                isPublished :true
            }
        })

        return NextResponse.json(publishedCourse)

    } catch (error) {
        console.log("[COURSE_ID_PUBLISH", error);
        return new NextResponse("Internal Server Error", { status : 500 } )
    }
}