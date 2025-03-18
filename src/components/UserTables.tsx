"use client"

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table"

type UserProps = {
    id: string
    name: string
    teamName: string | null
    score: number
}

type TeamProps = {
    id: string
    name: string
    netScore: number
}

type ChallengeProps = {
    id: string
    name: string
    points: number
}

export function UserTable({ users }: { users: UserProps[] }) {
    return <Table aria-label="User Table">
        <TableHeader>
            <TableColumn>User</TableColumn>
            <TableColumn>Team</TableColumn>
            <TableColumn>User Score</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No users found"}>
            {users.map(user => (
                <TableRow key={user.id}>
                    <TableCell>{user.name.toUpperCase()}</TableCell>
                    <TableCell>{user.teamName || "No Team"}</TableCell>
                    <TableCell>{user.score}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
}

export function TeamTable({ teams }: { teams: TeamProps[] }) {
    return <Table aria-label="User Table">
        <TableHeader>
            <TableColumn>Team Name</TableColumn>
            <TableColumn>Total Score</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No teams found"}>
            {teams.map(team => (
                <TableRow key={team.id}>
                    <TableCell className="flex flex-col">{team.name.toUpperCase()}</TableCell>
                    <TableCell>{team.netScore}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
}

export function TeamMembersTable({ users }: { users: UserProps[] }) {
    return <Table aria-label="Your Team Members Table">
        <TableHeader>
            <TableColumn>User Name</TableColumn>
            <TableColumn>Score</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No members found"}>
            {users.map(user => (
                <TableRow key={user.id}>
                    <TableCell className="flex flex-col">{user.name.toUpperCase()}</TableCell>
                    <TableCell>{user.score}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
}

export function TeamSolvedTable({ challenges }: { challenges: ChallengeProps[] }) {
    return <Table aria-label="Your Team Solved Challenges Table">
        <TableHeader>
            <TableColumn>Challenge Name</TableColumn>
            <TableColumn>Points</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No challenges solved yet!"}>
            {challenges.map(challenge => (
                <TableRow key={challenge.id}>
                    <TableCell className="flex flex-col">{challenge.name.toUpperCase()}</TableCell>
                    <TableCell>{challenge.points}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
}