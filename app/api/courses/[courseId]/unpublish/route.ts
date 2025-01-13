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
            }
        });

        if (!course) {
            return new NextResponse("Not Found", { status : 404})
        }


        const unPublishedCourse = await db.course.update({
            where : {
                id : params.courseId,
                userId
            },
            data :{
                isPublished :false
            }
        })

        return NextResponse.json(unPublishedCourse)

    } catch (error) {
        console.log("[COURSE_ID_UNPUBLISH", error);
        return new NextResponse("Internal Server Error", { status : 500 } )
    }
}