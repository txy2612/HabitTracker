import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { getStreak as getStreakService } from "./streaks.service.js";
/* Imports ⭐:
   1.Zod lets us define schemas 
   2.validate (middleware): take Zod schema and check whether req matches it 
   3.imports business logic (hire postman)

 */

/* The file does 4 things: (sounds like post office + postman) ⭐
 1. receive HTTP req (person go to post office & ask writer to write)
 2. validate input (person says, writer try to check grammar)
 3. calls service (writer pass letter to postman)
 4. sends response back (writer pass responds letter to the person)

 Flow:
 1. frontend sends req: GET /api/habits/:id/streak
 2. streak.routes.ts: validate
 getStreak(): call service
 3. streaks.service: cal streak
 4. stored to repo
 5. return streak
 6. controller sends JSON
 7. frontend received streak
 */

 // A)Schema says: the REQ must contain
 // params -> id
 // - string - min 1 char
 /* Why only params? ⭐
    - GET /api/habits/:id/streak
    - then express creates a habit

    Why not body:
    - usually larger input: POST, PATCH, PUT

    Why not query?
    - No '?'
    - eg: GET /api/habits/habit-123/streak?month=2026-07
  */
const getStreakRequestSchema = z.object({
  params: z.object({ id: z.string().min(1, "Habit id is required.") }),
});
// B) type 
// infer - lets the TYPE stays in sync with SCHEMA ⭐
// if shcema updated, type updates automatically
/* Instead of manually writing:
  type GetStreakRequest = {
    params: {
        id: string;
    };
}
 */
type GetStreakRequest = z.infer<typeof getStreakRequestSchema>;

// C)Controller
// GET /api/habits/:id/streak
// function getStreak()
// : RequestHandler = getStreak must follow the structure of an Express Request Handler ⭐
const getStreak: RequestHandler = async (request, response, next) => {
  try {
    // getting validatED data, NOT request.params
    // because middleware already checked it
    const { params } = request.validated as GetStreakRequest;

    /*await = calls service
       it passes: ⭐
       1) user id: request.user!.id
          comes from: login -> JWT -> auth midware -> request.user
       2) habit id: params.id
          comes from: /:id/streak

      Why? you need to authenticate + get habitId to track the streak
    */
    /*return response in JSON to frontend
        eg: currentStreak: 7,
        longestStreak: 12

        to:"currentStreak":7,
        "longestStreak":12
    */
    response.json(await getStreakService(request.user!.id, params.id));
  } catch (error) {
    next(error);
  }
};

//creates a router (mini receptionist)
export const streaksRoutes = Router();
//registers the endpoint
// because you need schema to register, so register last (you need writer to write b4 you want to send letter)
streaksRoutes.get("/:id/streak", validate(getStreakRequestSchema), getStreak);

/*
Execution order is:

Incoming request
      │
      ▼
validate(getStreakRequestSchema)
      │
      ▼
✓ Valid?
      │
      ├── No → return validation error
      │
      ▼
getStreak()
      │
      ▼
getStreakService()
      │
      ▼
response.json()
 */
