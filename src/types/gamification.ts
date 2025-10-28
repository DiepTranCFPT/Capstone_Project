import type { QuestionBankItem } from './test';

export interface QuizBattle {
    id: string;
    playerOneId: string;
    playerTwoId: string;
    questions: QuestionBankItem[];
    scores: {
        playerOne: number;
        playerTwo: number;
    };
    status: 'waiting' | 'in-progress' | 'finished';
    winnerId?: string;
}
