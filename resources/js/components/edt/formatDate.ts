
export function formatDate(date: Date | string){
    const day = new Date(date).toLocaleDateString('fr-FR')

    return day
}


export function inputDate(date: string | null): string {
    if (!date) {
return ''
}

    return date.split('T')[0].split(' ')[0]
}